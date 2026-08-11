<div align="center">
  <h1>📱 PocketDB Mobile Node</h1>
  <p><strong>Transforma tu teléfono en un servidor de base de datos relacional en la nube.</strong></p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
</div>

<br />

## 🚀 ¿Qué es PocketDB?
PocketDB Mobile Node es una aplicación construida con React Native que levanta un motor **SQLite** local en tu dispositivo y se conecta a un servidor Relay en la nube vía WebSockets. Esto permite que cualquier desarrollador pueda enviar consultas SQL desde su computadora y ejecutarlas físicamente en el almacenamiento del teléfono.

## 🌟 Dos Formas de Usar PocketDB

Este proyecto está diseñado con la flexibilidad en mente:

### 1. La Vía Rápida (Uso Público)
No necesitas programar nada. Pronto publicaremos el **APK oficial**. Solo tendrás que descargarlo, abrirlo y automáticamente se conectará a nuestro **Servidor Relay Público** (siempre encendido). Estarás listo para mandar consultas a tu teléfono en segundos.

### 2. La Vía Privada (Self-Hosted / Open Source)
¿Quieres control total por privacidad o modificar la interfaz de la app? 
Al ser Open Source, puedes clonar este repositorio, modificar el diseño, y apuntar la aplicación a **tu propio servidor Relay privado**. Dentro de la app hay un campo para cambiar la URL del servidor fácilmente.

## ✨ Características Principales
- **Interfaz Premium:** Diseño oscuro, moderno y optimizado para desarrolladores.
- **Túnel Inverso Integrado:** Sin IPs estáticas ni puertos abiertos.
- **Terminal en Tiempo Real:** Visualiza las consultas SQL (`SELECT`, `INSERT`, `CREATE TABLE`) en vivo en la pantalla de tu celular.

## 🛠️ Instalación para Desarrolladores (Self-Hosted)

Si eliges la Vía Privada y quieres compilar la app tú mismo:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/NekoCoder-en/PocketDB.git
   cd PocketDB
   ```

2. **Instala dependencias e inicia:**
   ```bash
   npm install
   npm start
   ```

3. **Conexión:**
   Asegúrate de clonar y levantar también el [PocketDB Relay Server](https://github.com/NekoCoder-en/server-pocketDB), y pegar la URL de tu servidor en la app móvil.

---
*Construido para hacer el desarrollo móvil y edge computing más accesible para todos.*
