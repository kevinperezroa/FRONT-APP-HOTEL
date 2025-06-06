document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post("https://app-reservation-hotel-web.onrender.com/api/login", {
            username,
            password
        });

        const token = response.data.acces_token;
        const userName = response.data.user_name || username;

        localStorage.setItem("token", token);

        //  Mensaje de bienvenida con el nombre del usuario
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido, ${userName}!`,
            text: response.data.message || 'Inicio de sesión exitoso',
            timer: 1800,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "/templates/dashboard/dashboard.html";
        });

    } catch (error) {
        const errMsg = error.response?.data?.detail || "Error desconocido. Por favor, intenta de nuevo.";

        Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: errMsg
        });

        localStorage.removeItem("token");
    }
});
