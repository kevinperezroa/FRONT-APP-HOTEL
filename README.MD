# 🏨 FRONTEND APP RESERVATION HOTEL WEB
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/CSS-Styling-1572B6.svg)](https://developer.mozilla.org/es/docs/Web/CSS)
[![HTML](https://img.shields.io/badge/HTML5-Markup-E34F26.svg)](https://developer.mozilla.org/es/docs/Web/HTML)
[![Axios](https://img.shields.io/badge/Axios-HTTP%20Client-5A29E4.svg)](https://axios-http.com/es/)
[![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-IDE-blue.svg)](https://code.visualstudio.com/)
---
Interfaz de usuario web para la gestión de reservas hoteleras. Este proyecto consume la API RESTful del backend para permitir a los usuarios interactuar con las funcionalidades de administración de habitaciones, clientes, reservas, etc.

## 🖥️ Interfaz Web para la Gestión de Reservas Hoteleras
La interfaz de usuario "FRONTEND APP RESERVATION HOTEL WEB" proporciona una experiencia para interactuar con el backend de la API de reservas hoteleras. Permite a los usuarios visualizar información, realizar acciones y gestionar los datos del sistema de manera eficiente a través de un navegador web.

## ✨ Funciones clave:
- Visualización y gestión de clientes.
- Interfaz para la gestión de reservas.
- Posible interfaz de administración de habitaciones.
- Sección de panel de control (dashboard) con información relevante.
- Formulario de inicio de sesión para usuarios.
- Interfaz para la gestión de usuarios del sistema.

Esta interfaz web está diseñada para ser funcional, proporcionando acceso a las principales funcionalidades del sistema de reservas hoteleras.


## 🚀 TECNOLOGÍAS UTILIZADAS
- JavaScript (Lenguaje de programación principal)
- CSS (Lenguaje de estilos para la presentación)
- HTML (Lenguaje de marcado para la estructura)
- Axios (Cliente HTTP basado en promesas para realizar peticiones al backend)

## 📦 REQUISITOS PREVIOS
Antes de comenzar, asegúrate de tener un navegador web moderno instalado.

## 🛠️ CONFIGURACIÓN DEL PROYECTO (PASO A PASO)
🔹 Paso 1: Obtener los archivos del proyecto
Puedes descargar los archivos del repositorio o clonarlo utilizando Git:
    git clone https://github.com/kevinperezroa/FRONT-APP-HOTEL.git
    cd FRONT-APP-HOTEL

🔹 Paso 2: Abrir el archivo `index.html` en tu navegador web.
Este proyecto parece ser un frontend estático que se ejecuta directamente en el navegador, por lo que no requiere un servidor de desarrollo complejo como Vite o Node.js para iniciarse. Simplemente abre el archivo `index.html` con tu navegador.

🔹 Paso 3: Configurar la URL del backend
Deberás localizar en los archivos JavaScript (probablemente dentro de las carpetas `clients`, `dashboard`, `login`, `reservation`, `room` o `user`) la parte del código donde se realizan las llamadas a la API del backend. Allí, asegúrate de que la URL base de la API esté configurada correctamente para que coincida con la dirección donde se está ejecutando el backend.


## 📤 INTERACCIÓN CON EL BACKEND
Esta aplicación frontend realiza peticiones HTTP a la API RESTful del backend (descrita en el otro `README.md`) utilizando la librería `axios` (o alguna función similar para realizar peticiones). Asegúrate de que el backend esté en funcionamiento para que la interfaz pueda mostrar y gestionar los datos correctamente.

Los principales endpoints del backend con los que interactúa este frontend probablemente incluyen:
- `/clients/` (GET, POST) para listar y registrar clientes.
- `/reservations/` (GET, POST, DELETE/{id}) para listar, crear y eliminar reservas.
- `/rooms/` (GET) para listar habitaciones.
- `/room_types/` (GET) para listar tipos de habitaciones.
- `/login/` (POST) para la autenticación de usuarios.
- `/users/` (GET, POST, etc.) para la gestión de usuarios.
- (Y otros endpoints definidos en la documentación del backend).


## 📂 ESTRUCTURA DEL PROYECTO
- `📂 templates/` - Contiene las plantillas HTML para las diferentes páginas de la aplicación.
  - `📂 clients/` - Archivos relacionados con la sección de clientes.
    - `clients.css` - Estilos CSS específicos para la página de clientes.
    - `clients.html` - Estructura HTML de la página de clientes.
    - `clients.js` - Lógica JavaScript para la interactividad de la página de clientes.
  - `📂 dashboard/` - Archivos relacionados con el panel de control.
    - `dashboard.css` - Estilos CSS específicos para el panel de control.
    - `dashboard.html` - Estructura HTML del panel de control.
    - `dashboard.js` - Lógica JavaScript para la interactividad del panel de control.
  - `📂 login/` - Archivos relacionados con la página de inicio de sesión.
    - `login.css` - Estilos CSS específicos para la página de inicio de sesión.
    - `login.html` - Estructura HTML de la página de inicio de sesión.
    - `login.js` - Lógica JavaScript para la interactividad de la página de inicio de sesión.
  - `📂 reservation/` - Archivos relacionados con la sección de reservas.
    - `reservation.css` - Estilos CSS específicos para la página de reservas.
    - `reservation.html` - Estructura HTML de la página de reservas.
    - `reservation.js` - Lógica JavaScript para la interactividad de la página de reservas.
  - `📂 room/` - Archivos relacionados con la sección de habitaciones.
    - `room.css` - Estilos CSS específicos para la página de habitaciones.
    - `room.html` - Estructura HTML de la página de habitaciones.
    - `room.js` - Lógica JavaScript para la interactividad de la página de habitaciones.
  - `📂 user/` - Archivos relacionados con la sección de usuarios.
    - `user.css` - Estilos CSS específicos para la página de usuarios.
    - `user.html` - Estructura HTML de la página de usuarios.
    - `user.js` - Lógica JavaScript para la interactividad de la página de usuarios.
- `.gitattributes` - Define atributos específicos de la ruta para Git (manejo de fin de línea, etc.).
- `index.html` - El punto de entrada principal de la aplicación web (la página de inicio).

**Descripción de las carpetas y archivos:**

- **`templates/`**: Contiene las diferentes secciones o páginas de la aplicación.
    - **`clients/`**: Archivos relacionados con la gestión de clientes (HTML, CSS, JavaScript).
    - **`dashboard/`**: Archivos para el panel de control principal.
    - **`login/`**: Archivos para la funcionalidad de inicio de sesión.
    - **`reservation/`**: Archivos para la gestión de reservas.
    - **`room/`**: Archivos relacionados con la gestión de habitaciones.
    - **`user/`**: Archivos para la gestión de usuarios del sistema.
- **`.gitattributes`**: Archivo para definir atributos de los archivos en el repositorio Git.
- **`index.html`**: El archivo HTML principal que probablemente sirve como punto de entrada de la aplicación.


## 👥 COLABORADORES

| Nombre     | Rol               | GitHub                                 |
|------------|------------------ |----------------------------------------|
| Jhoan Acosta| Backend Developer| https://github.com/Blazkull            |
| Kevin Perez| Frontend Developer| https://github.com/kevinperezroa       |
| Rafael Jimenez| Database Administrator | https://github.com/Tstark601        |


## 📌 NOTAS FINALES
- Asegúrate de que la URL del backend esté correctamente configurada en los archivos JavaScript para que la aplicación frontend pueda comunicarse con él.
- Utiliza las herramientas de desarrollo del navegador para inspeccionar las peticiones HTTP y la respuesta del backend en caso de problemas.
- Este frontend proporciona la interfaz visual para que los usuarios interactúen con el sistema de reservas hoteleras gestionado por el backend.
- Puedes expandir esta interfaz con más funcionalidades, mejoras de diseño y validaciones de usuario, modificando los archivos HTML, CSS y JavaScript dentro de la carpeta `templates`.

¡Excelente! Con esta estructura de carpetas, el `README.md` del frontend es mucho más preciso. He ajustado la sección de configuración para reflejar que se trata de un frontend que probablemente se ejecuta directamente en el navegador.
