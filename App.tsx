import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

interface LogEntry {
  id: string;
  type: 'info' | 'error' | 'success' | 'query';
  message: string;
  time: string;
}

type ConnectionStatus = 'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO';

export default function App() {
  const [relayUrl, setRelayUrl] = useState<string>(process.env.EXPO_PUBLIC_RELAY_URL || '');
  const [deviceId, setDeviceId] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>('DESCONECTADO');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const dbsRef = useRef<Record<string, SQLite.SQLiteDatabase>>({});
  const [activeDbName, setActiveDbName] = useState<string>('pocketdb_main.db');
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    // Inicializar base de datos local
    async function initDB() {
      try {
        dbsRef.current['pocketdb_main.db'] = await SQLite.openDatabaseAsync('pocketdb_main.db');
        addLog('info', 'Base de datos SQLite local inicializada.');
      } catch (e: any) {
        addLog('error', `Error al inicializar DB: ${e.message}`);
      }
    }
    initDB();

    // Generar un ID de dispositivo único y corto
    setDeviceId(Math.random().toString(36).substring(2, 8).toUpperCase());

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { id: Date.now().toString(), type, message, time: new Date().toLocaleTimeString() }]);
  };

  const connectToRelay = () => {
    if (!relayUrl || status === 'CONECTANDO') return;
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setStatus('CONECTANDO');
    addLog('info', `Conectando a ${relayUrl}...`);

    const socket = io(relayUrl, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 5000,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('CONECTADO');
      addLog('success', 'Conexión exitosa con Relay.');
      // Registramos este dispositivo en el relay
      socket.emit('register_device', deviceId);
    });

    socket.on('disconnect', () => {
      setStatus('DESCONECTADO');
      addLog('error', 'Desconectado del servidor Relay.');
    });

    socket.on('connect_error', (err: Error) => {
      setStatus('DESCONECTADO');
      addLog('error', `Error de conexión: ${err.message}`);
    });

    // Escuchar peticiones SQL del servidor Relay
    socket.on('execute_query', async (data: any) => {
      const { queryId, sql, args = [] } = data;
      addLog('query', `Ejecutando: ${sql}`);
      
      try {
        const upperSql = sql.trim().toUpperCase();
        
        // --- 1. SHOW DATABASES ---
        if (upperSql === 'SHOW DATABASES;' || upperSql === 'SHOW DATABASES') {
          const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
          const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
          
          if (!dirInfo.exists) {
            socket.emit('query_result', { queryId, result: [{ Database: 'pocketdb_main' }] });
            return;
          }
          const files = await FileSystem.readDirectoryAsync(sqliteDir);
          const databases = files.filter(f => f.endsWith('.db')).map(f => ({ Database: f.replace('.db', '') }));
          socket.emit('query_result', { queryId, result: databases });
          addLog('success', 'Bases de datos listadas.');
          return;
        }

        // --- 2. CREATE DATABASE ---
        if (upperSql.startsWith('CREATE DATABASE ')) {
          const dbNameMatch = sql.match(/CREATE\s+DATABASE\s+([a-zA-Z0-9_]+)/i);
          if (dbNameMatch && dbNameMatch[1]) {
            const dbName = `${dbNameMatch[1]}.db`;
            dbsRef.current[dbName] = await SQLite.openDatabaseAsync(dbName);
            socket.emit('query_result', { queryId, result: { affectedRows: 1, message: `Database '${dbNameMatch[1]}' created` } });
            addLog('success', `Base de datos creada: ${dbNameMatch[1]}`);
            return;
          }
        }

        // --- 3. USE DATABASE ---
        if (upperSql.startsWith('USE ')) {
          const dbNameMatch = sql.match(/USE\s+([a-zA-Z0-9_]+)/i);
          if (dbNameMatch && dbNameMatch[1]) {
            const dbName = `${dbNameMatch[1]}.db`;
            if (!dbsRef.current[dbName]) {
              dbsRef.current[dbName] = await SQLite.openDatabaseAsync(dbName);
            }
            setActiveDbName(dbName);
            socket.emit('query_result', { queryId, result: { affectedRows: 0, message: `Database changed to '${dbNameMatch[1]}'` } });
            addLog('success', `Cambiado a BD: ${dbNameMatch[1]}`);
            return;
          }
        }

        // --- 4. CONSULTAS NORMALES ---
        // Usar un valor local de activeDbName para evitar problemas de cierres de hooks antiguos
        setActiveDbName(currentActive => {
          (async () => {
            if (!dbsRef.current[currentActive]) {
              dbsRef.current[currentActive] = await SQLite.openDatabaseAsync(currentActive);
            }
            const db = dbsRef.current[currentActive];
            
            try {
              let result: any;
              if (upperSql.startsWith('SELECT') || upperSql.startsWith('PRAGMA')) {
                result = await db.getAllAsync(sql, args);
              } else {
                result = await db.runAsync(sql, args);
              }
              
              socket.emit('query_result', { queryId, result });
              addLog('success', `Query OK en ${currentActive.replace('.db', '')}. Filas/Afectados: ${result?.length ?? result?.changes ?? 0}`);
            } catch (err: any) {
              addLog('error', `Error SQL en ${currentActive.replace('.db', '')}: ${err.message}`);
              socket.emit('query_result', { queryId, error: err.message });
            }
          })();
          return currentActive;
        });

      } catch (error: any) {
        addLog('error', `Error de parseo: ${error.message}`);
        socket.emit('query_result', { queryId, error: error.message });
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Pocket<Text style={styles.titleAccent}>DB</Text></Text>
          <Text style={styles.subtitle}>Cloud Database Edge Node</Text>
        </View>

        {/* Tarjeta de Estado y Configuración */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: status === 'CONECTADO' ? '#00E676' : status === 'CONECTANDO' ? '#FFEA00' : '#FF1744' }]} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.deviceLabel}>ID: <Text style={styles.deviceId}>{deviceId}</Text></Text>
              <Text style={styles.activeDbLabel}>BD Activa: <Text style={styles.activeDbName}>{activeDbName.replace('.db', '')}</Text></Text>
            </View>
          </View>

          <Text style={styles.label}>URL del Servidor Relay:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={relayUrl}
              onChangeText={setRelayUrl}
              placeholder="https://tu-relay-server.fly.dev"
              placeholderTextColor="#5C6B89"
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity 
              style={[styles.button, status === 'CONECTADO' ? styles.buttonDisconnect : styles.buttonConnect]} 
              onPress={status === 'CONECTADO' ? () => socketRef.current?.disconnect() : connectToRelay}
            >
              {status === 'CONECTANDO' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>{status === 'CONECTADO' ? 'Detener' : 'Conectar'}</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>Reemplaza las 'x' con la IP local de tu PC donde corre el Relay.</Text>
        </View>

        {/* Terminal de Logs */}
        <Text style={styles.sectionTitle}>Registro de Actividad</Text>
        <View style={styles.terminalContainer}>
          <ScrollView 
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            style={styles.terminal}
          >
            {logs.length === 0 ? (
              <Text style={styles.terminalEmpty}>Esperando peticiones...</Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.logLine}>
                  <Text style={styles.logTime}>[{log.time}]</Text>
                  <Text style={[
                    styles.logMessage, 
                    log.type === 'error' && styles.logError,
                    log.type === 'success' && styles.logSuccess,
                    log.type === 'query' && styles.logQuery,
                    log.type === 'info' && styles.logInfo,
                  ]}>
                    {log.message}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  title: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  titleAccent: { color: '#00F2FE' },
  subtitle: { fontSize: 14, color: '#8A99B5', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  card: { backgroundColor: '#151C2C', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#242F4A', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#242F4A', paddingBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0F19', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#242F4A' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#E2E8F0', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  deviceLabel: { color: '#8A99B5', fontSize: 14 },
  deviceId: { color: '#00F2FE', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  activeDbLabel: { color: '#8A99B5', fontSize: 11, marginTop: 4 },
  activeDbName: { color: '#E2E8F0', fontWeight: 'bold' },
  label: { color: '#8A99B5', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#0B0F19', color: '#FFFFFF', height: 48, borderRadius: 8, paddingHorizontal: 16, fontSize: 14, borderWidth: 1, borderColor: '#242F4A', marginRight: 12 },
  button: { height: 48, paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonConnect: { backgroundColor: '#00F2FE' },
  buttonDisconnect: { backgroundColor: '#FF1744' },
  buttonText: { color: '#0B0F19', fontWeight: '700', fontSize: 14 },
  hintText: { color: '#5C6B89', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  terminalContainer: { flex: 1, backgroundColor: '#000000', borderRadius: 12, borderWidth: 1, borderColor: '#242F4A', overflow: 'hidden' },
  terminal: { flex: 1, padding: 16 },
  terminalEmpty: { color: '#5C6B89', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, textAlign: 'center', marginTop: 20 },
  logLine: { flexDirection: 'row', marginBottom: 6 },
  logTime: { color: '#5C6B89', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, marginRight: 8, width: 75 },
  logMessage: { flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, lineHeight: 16 },
  logInfo: { color: '#8A99B5' },
  logQuery: { color: '#00F2FE' },
  logSuccess: { color: '#00E676' },
  logError: { color: '#FF1744' },
});
