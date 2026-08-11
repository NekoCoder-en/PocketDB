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
PocketDB Mobile Node es una aplicación construida con React Native (Expo) que levanta un motor **SQLite** local en tu dispositivo y se conecta a un servidor Relay en la nube vía **WebSockets**. Esto permite que cualquier desarrollador pueda enviar consultas SQL desde su computadora y ejecutarlas físicamente en el almacenamiento del teléfono, convirtiéndolo en un *Edge Node* gratuito.

## ✨ Características
- **Interfaz Premium:** Diseño oscuro, moderno y optimizado para la experiencia del desarrollador.
- **Túnel Inverso Integrado:** Sin configuraciones complejas de red, IPs estáticas o puertos abiertos.
- **Terminal en Tiempo Real:** Visualiza las consultas SQL (`SELECT`, `INSERT`, `CREATE TABLE`) ejecutándose en vivo en la pantalla de tu celular.
- **TypeScript:** Tipado estático para asegurar la estabilidad del motor.

## 🛠️ Instalación y Uso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/NekoCoder-en/PocketDB.git
   cd PocketDB
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el entorno de desarrollo:**
   ```bash
   npm start
   ```

4. **Prueba en tu Teléfono:**
   - Descarga **Expo Go** en tu Android o iOS.
   - Escanea el código QR que aparece en tu terminal.
   - ¡Listo! Configura la URL de tu Servidor Relay en la pantalla principal y presiona *Conectar*.

## 📡 Integración con el Servidor Relay
Esta aplicación requiere el [PocketDB Relay Server](https://github.com/NekoCoder-en/server-pocketDB) para funcionar. Asegúrate de tener tu Relay corriendo (ya sea localmente o desplegado en Fly.io) y pega la URL correspondiente en la app móvil.

---
*Hecho con ❤️ para desarrolladores que buscan herramientas ágiles.*
