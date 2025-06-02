document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://127.0.0.1:8000/api/user/";
    let users = [];

    // IMPORTANTE: Necesitas una forma de obtener el ID del usuario actualmente logueado.
    // Asumo que se almacena en localStorage después del login.
    // Reemplaza 'loggedInUserId' con la clave real que uses para guardar el ID del usuario.
    const loggedInUserId = parseInt(localStorage.getItem("loggedInUserId"));

    const userForm = document.getElementById("userForm");
    const userModalElement = document.getElementById("userModal");
    const userModal = new bootstrap.Modal(userModalElement);
    const statusFilter = document.getElementById("statusFilter");
    const togglePasswordButton = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");

    /**
     * Configura una instancia de Axios con el token de autenticación del localStorage.
     * Redirige a la página de inicio de sesión si no se encuentra el token.
     * @returns {object} Una instancia de Axios configurada con el token de autorización.
     */
    function getAuthAxios() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No se encontró el token de autenticación.");
            Swal.fire({
                title: "No autorizado",
                text: "Por favor, inicia sesión para continuar.",
                icon: "warning",
                confirmButtonText: "Ir a Iniciar Sesión",
            }).then(() => {
                window.location.href = "/index.html";
            });
            throw new Error("No authentication token.");
        }
        return axios.create({
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Maneja errores de Axios y muestra SweetAlerts apropiados.
     * @param {object} error - El objeto de error de Axios.
     * @param {string} defaultTitle - Título por defecto para el SweetAlert.
     * @param {string} defaultText - Texto por defecto para el SweetAlert.
     */
    function handleAxiosError(error, defaultTitle = "Error", defaultText = "Ocurrió un problema inesperado.") {
        console.error(defaultTitle, error);
        if (error.response) {
            if (error.response.status === 401) {
                Swal.fire({
                    title: "Sesión expirada o no autorizada",
                    text: "Por favor, inicia sesión de nuevo.",
                    icon: "warning",
                    confirmButtonText: "Ir a Iniciar Sesión",
                }).then(() => {
                    window.location.href = "/index.html";
                });
            } else {
                Swal.fire({
                    title: `Error del servidor (${error.response.status})`,
                    text: error.response.data.detail || error.response.data.message || error.response.statusText || defaultText,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        } else if (error.request) {
            Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo y sea accesible.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        } else {
            Swal.fire({
                title: defaultTitle,
                text: defaultText + " Detalles: " + error.message,
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    }

    // Obtener usuarios
    async function fetchUsers() {
        try {
            const authAxios = getAuthAxios();
            const response = await authAxios.get(apiUrl);
            users = response.data;
            renderFilteredUsers();
        } catch (error) {
            handleAxiosError(error, "Error al obtener usuarios", "No se pudieron cargar los datos de los usuarios.");
        }
    }

    // Filtrar usuarios por estado y búsqueda
    function getFilteredUsers() {
        const query = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
        const status = statusFilter.value;

        return users.filter(u => {
            const matchesQuery =
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query);

            const matchesStatus =
                status === "all" ||
                (status === "active" && u.active) ||
                (status === "inactive" && !u.active);

            return matchesQuery && matchesStatus;
        });
    }

    function renderFilteredUsers() {
        const filtered = getFilteredUsers();
        const container = document.getElementById("userTableBody");
        if (!container) {
            console.error("Elemento userTableBody no encontrado.");
            return;
        }

        container.innerHTML = "";
        if (filtered.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron usuarios que coincidan con los filtros.</td></tr>`;
            return;
        }

        filtered.forEach((u) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.user_type_id === 1 ? "Administrador" : "Usuario normal"}</td>
                <td>
                    <span class="badge bg-${u.active ? "success" : "secondary"}">
                        ${u.active ? "Activo" : "Inactivo"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editUser(${u.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}" onclick="toggleUserStatus(${u.id}, ${u.active})">
                        <i class="bi ${u.active ? 'bi-person-dash' : 'bi-person-check'}"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    // Editar usuario
    window.editUser = async function (id) {
        try {
            const authAxios = getAuthAxios();
            const { data } = await authAxios.get(`${apiUrl}${id}`);
            document.getElementById("userId").value = data.id;
            document.getElementById("username").value = data.username;
            document.getElementById("email").value = data.email;
            document.getElementById("password").value = ""; // Clear password field for security
            document.getElementById("user_type_id").value = data.user_type_id;
            userModal.show();
        } catch (error) {
            handleAxiosError(error, "Error al cargar datos del usuario para editar", "No se pudieron obtener los detalles del usuario.");
        }
    };

    // Cambiar estado del usuario
    window.toggleUserStatus = async function (id, currentStatus) {
        // PREVENIR QUE EL USUARIO LOGUEADO SE DESACTIVE A SÍ MISMO
        if (id === loggedInUserId && currentStatus === true) {
            Swal.fire({
                title: "Acción no permitida",
                text: "No puedes desactivar tu propia cuenta mientras estás logueado.",
                icon: "info",
                confirmButtonText: "Entendido"
            });
            return; // Detener la ejecución de la función
        }

        const actionText = currentStatus ? "inactivar" : "activar";
        const confirmButtonColor = currentStatus ? "#dc3545" : "#198754"; // Rojo para inactivar, Verde para activar

        const result = await Swal.fire({
            title: `¿Estás seguro de ${actionText} este usuario?`,
            text: `El usuario será ${actionText === 'inactivar' ? 'marcado como inactivo' : 'activado'}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${actionText}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: confirmButtonColor,
            cancelButtonColor: "#6c757d"
        });

        if (result.isConfirmed) {
            try {
                const authAxios = getAuthAxios();
                await authAxios.patch(`${apiUrl}${id}`, { active: !currentStatus });
                Swal.fire("¡Éxito!", `El usuario ha sido ${actionText === 'inactivar' ? 'inactivado' : 'activado'} correctamente.`, "success");
                fetchUsers(); // Re-fetch to update the table
            } catch (error) {
                handleAxiosError(error, "Error al cambiar el estado del usuario", `No se pudo ${actionText} el usuario.`);
            }
        }
    };

    // Guardar usuario (crear o actualizar)
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("userId").value;
        const userData = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value, // Only send if updating or creating
            user_type_id: parseInt(document.getElementById("user_type_id").value),
        };

        // Solo incluir contraseña si no está vacía (para actualizaciones) o si es un nuevo usuario
        if (userData.password === "" && id) {
            delete userData.password; // No enviar contraseña vacía en la actualización si no se cambió
        }

        try {
            const authAxios = getAuthAxios();
            if (id) {
                await authAxios.patch(`${apiUrl}${id}`, userData);
                Swal.fire("¡Actualizado!", "Usuario actualizado correctamente.", "success");
            } else {
                if (!userData.password) {
                    Swal.fire("Error", "La contraseña es requerida para nuevos usuarios.", "error");
                    return;
                }
                await authAxios.post(apiUrl, userData);
                Swal.fire("¡Creado!", "Usuario creado correctamente.", "success");
            }
            userModal.hide();
            userForm.reset();
            fetchUsers();
        } catch (error) {
            handleAxiosError(error, "Error al guardar usuario", "No se pudo guardar el usuario. Verifica los datos e intenta de nuevo.");
        }
    });

    // Event listeners para filtros y búsqueda
    statusFilter.addEventListener("change", renderFilteredUsers);
    document.getElementById("searchInput").addEventListener("input", renderFilteredUsers);


    // Función para mostrar/ocultar contraseña
    window.togglePasswordVisibility = function () {
        const currentType = passwordField.type;
        passwordField.type = currentType === "password" ? "text" : "password";
        togglePasswordButton.innerHTML = `<i class="bi bi-eye${passwordField.type === "password" ? '' : '-slash'}"></i>`;
    };

    // Inicializar el ícono del botón de mostrar/ocultar contraseña
    if (togglePasswordButton) {
        togglePasswordButton.innerHTML = `<i class="bi bi-eye"></i>`;
    }

    // Función para abrir el modal de creación de usuario (limpia el formulario primero)
    window.openUserModal = function() {
        userForm.reset();
        document.getElementById("userId").value = ""; // Limpiar el campo ID oculto
        passwordField.type = "password"; // Reiniciar el tipo del campo de contraseña
        if (togglePasswordButton) {
            togglePasswordButton.innerHTML = `<i class="bi bi-eye"></i>`; // Reiniciar el ícono del ojo
        }
        userModal.show();
    }

    // Llama a la función fetchUsers al cargar la página para inicializar los datos
    fetchUsers();
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

// Cerrar sesión
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tu sesión actual se cerrará.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("token"); // Elimina el token
            Swal.fire({
                title: "Sesión cerrada",
                text: "Has cerrado sesión correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/index.html"; // Redirige al login
            });
        }
    });
});
