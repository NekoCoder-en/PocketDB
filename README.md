<div align="center">
  <img src="https://raw.githubusercontent.com/expo/expo/main/docs/public/static/images/expo-logo.png" width="80" alt="Expo Logo"/>
  <h1>📱 PocketDB Mobile Node</h1>
  <p><strong>Transforma tu teléfono en un clúster de bases de datos relacionales en la nube.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  </p>
</div>

<br />

## 🚀 ¿Qué es PocketDB?

PocketDB Mobile Node es una aplicación móvil innovadora que permite utilizar **tu propio dispositivo móvil como un servidor de base de datos en la nube (Edge Node)**. 

Bajo el capó, utiliza el motor nativo de **SQLite** ultra rápido, pero se conecta a través de WebSockets a un [Relay Server](https://github.com/NekoCoder-en/server-pocketDB) para recibir peticiones SQL desde cualquier lugar del mundo. Rompe las barreras del *NAT Traversal*, eliminando la necesidad de IPs públicas, puertos abiertos o configuraciones complejas de enrutadores.

## ✨ Características Principales

*   **Soporte Multi-Base de Datos:** A diferencia de una implementación normal de SQLite, nuestra aplicación gestiona dinámicamente el sistema de archivos (File System). Puedes enviar comandos como `CREATE DATABASE tienda;` y la app creará un nuevo archivo físico al vuelo, manteniendo tus tablas 100% aisladas.
*   **Túnel Inverso Integrado:** Al usar WebSockets hacia un servidor Relay (como Render o Fly.io), tu teléfono puede recibir consultas SQL desde cualquier servidor Node.js o App web externa.
*   **Terminal de Logs en Tiempo Real:** Interfaz oscura (Dark Mode) premium diseñada para desarrolladores. Ve exactamente qué comandos `SELECT`, `INSERT` o `CREATE` está procesando tu teléfono en tiempo real.
*   **Gestión de Energía Optimizada:** Conexiones socket ultraligeras y seguras.

---

## 🛠️ Instalación y Configuración

Si deseas clonar y correr la aplicación en tu entorno local para desarrollo:

### 1. Clonar y Preparar
```bash
git clone https://github.com/NekoCoder-en/PocketDB.git
cd PocketDB
npm install
```

### 2. Configurar la Conexión (Opcional)
Para evitar escribir la URL de tu servidor cada vez que abras la app, puedes definirla como variable de entorno.
Copia el archivo de ejemplo y edítalo:
```bash
cp .env.example .env
```
Dentro de `.env`, coloca la URL de tu Relay Server (ej. `EXPO_PUBLIC_RELAY_URL=https://tu-servidor.onrender.com`).

### 3. Iniciar el Entorno
```bash
npm start
```
*   Descarga **Expo Go** en tu dispositivo físico (iOS/Android).
*   Escanea el código QR que aparece en tu terminal.
*   Una vez dentro, asegúrate de presionar **"Conectar"**. El estado cambiará a 🟢 **CONECTADO**.

---

## 🏗️ Cómo Generar el APK para Producción

Si deseas distribuir tu nodo para que otros lo instalen sin necesidad de Expo Go, puedes compilar el APK en la nube usando EAS (Expo Application Services):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
*El resultado será un link de descarga directa de tu archivo `.apk`.*

---

## 📡 ¿Cómo usar la Base de Datos?

El teléfono **no recibe** conexiones HTTP directamente. Para enviarle consultas a tu teléfono, necesitas usar tu **Relay Server**. 

Si tienes dudas de cómo enviarle los comandos SQL al teléfono, por favor consulta la documentación completa del [Relay Server aquí](https://github.com/NekoCoder-en/server-pocketDB), donde encontrarás ejemplos de consumo vía la Consola Interactiva (CLI) o API REST (Axios/Fetch).

<div align="center">
  <p><i>Construido para hacer el edge computing móvil más accesible para todos.</i></p>
</div>
