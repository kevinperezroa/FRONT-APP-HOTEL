const apiUrl = "https://app-reservation-hotel-web.onrender.com/api/client";
const rowsPerPage = 12;
let currentPage = 1;
let clients = [];
let clientModalInstance;

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
            window.location.href = "/index.html"; // Redirige al login
        });
        throw new Error("No authentication token."); // Detiene la ejecución
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
        // Error de respuesta del servidor (ej. 401, 403, 404, 500)
        if (error.response.status === 401) {
            Swal.fire({
                title: "Sesión expirada o no autorizada",
                text: "Por favor, inicia sesión de nuevo.",
                icon: "warning",
                confirmButtonText: "Ir a Iniciar Sesión",
            }).then(() => {
                window.location.href = "/index.html"; // Redirige al login
            });
        } else {
            // Intenta obtener un mensaje de error más específico del backend
            const message = error.response.data.detail || error.response.data.message || error.response.statusText || defaultText;
            Swal.fire({
                title: `Error del servidor (${error.response.status})`,
                text: message,
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } else if (error.request) {
        // Error de red o el servidor no respondió
        Swal.fire({
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo y sea accesible.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    } else {
        // Errores al configurar la solicitud (ej. error en la URL)
        Swal.fire({
            title: defaultTitle,
            text: defaultText + " Detalles: " + error.message,
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

/**
 * Obtiene los clientes de la API utilizando el token de autenticación.
 */
async function fetchClients() {
    try {
        const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token
        const res = await authAxios.get(apiUrl);
        clients = res.data.map(c => ({ ...c, active: Boolean(c.active) }));
        renderTable();
        renderPagination(getFilteredClients().length);
    } catch (error) {
        handleAxiosError(error, "Error al cargar clientes", "No se pudieron obtener los datos de los clientes.");
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

function getFilteredClients() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const status = document.getElementById("statusFilter").value;

    return clients.filter(c => {
        const matchesQuery = !query || (
            c.first_name.toLowerCase().includes(query) ||
            c.last_name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.number_identification.toLowerCase().includes(query)
        );

        const matchesStatus =
            status === "all" ||
            (status === "active" && c.active === true) ||
            (status === "inactive" && c.active === false);

        return matchesQuery && matchesStatus;
    });
}

function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = "";

    const filtered = getFilteredClients();
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No se encontraron clientes que coincidan con los filtros.</td></tr>`;
        renderPagination(0); // Asegura que la paginación se actualice a 0 páginas
        return;
    }

    paginated.forEach(client => {
        const estadoTexto = client.active ? "Activo" : "Inactivo";
        const estadoClase = client.active ? "text-success" : "text-danger"; // Restablecido a las clases originales

        // Restaurado a los botones originales
        const actionBtn = client.active
            ? `<button class="btn btn-sm btn-danger btn-status-toggle" onclick='toggleClientStatus(${client.id}, false)'>Desactivar</button>`
            : `<button class="btn btn-sm btn-success btn-status-toggle" onclick='toggleClientStatus(${client.id}, true)'>Activar</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${client.id}</td>
                <td>${client.first_name}</td>
                <td>${client.last_name}</td>
                <td>${client.phone}</td>
                <td>${client.email}</td>
                <td>${client.number_identification}</td>
                <td><span class="${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <button class="btn btn-sm btn-custom me-1" onclick='openEditModal(${JSON.stringify(client)})'>Editar</button>
                    ${actionBtn}
                </td>
            </tr>`;
    });

    renderPagination(filtered.length);
}

function renderPagination(total) {
    const pageCount = Math.ceil(total / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const prevButton = document.createElement("li");
    prevButton.className = "page-item";
    prevButton.innerHTML = `<button class="page-link btn-custom" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
    pagination.appendChild(prevButton);

    for (let i = 1; i <= pageCount; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageItem.innerHTML = `<button class="page-link btn-custom" onclick="goToPage(${i})">${i}</button>`;
        pagination.appendChild(pageItem);
    }

    const nextButton = document.createElement("li");
    nextButton.className = "page-item";
    nextButton.innerHTML = `<button class="page-link btn-custom" onclick="goToPage(${currentPage + 1})" ${currentPage === pageCount ? 'disabled' : ''}>&raquo;</button>`;
    pagination.appendChild(nextButton);
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function openClientModal(client = {}) {
    document.getElementById("modalTitle").innerText = client.id ? "Editar Cliente" : "Crear Cliente";
    document.getElementById("clientId").value = client.id || "";
    document.getElementById("firstName").value = client.first_name || "";
    document.getElementById("lastName").value = client.last_name || "";
    document.getElementById("phone").value = client.phone || "";
    document.getElementById("email").value = client.email || "";
    document.getElementById("identification").value = client.number_identification || "";
    if (clientModalInstance) {
        clientModalInstance.show();
    }
}

function openEditModal(client) {
    openClientModal(client);
}

/**
 * Envía los datos del cliente (creación o edición) a la API.
 */
async function submitClient(e) {
    e.preventDefault();
    const id = document.getElementById("clientId").value;
    const data = {
        first_name: document.getElementById("firstName").value,
        last_name: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        number_identification: document.getElementById("identification").value,
    };

    const closeModal = () => {
        if (clientModalInstance) {
            setTimeout(() => {
                clientModalInstance.hide();
            }, 10);
        }
    };

    try {
        const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token
        if (id) {
            await authAxios.patch(`${apiUrl}/${id}/`, data); // Restaurado el slash final si tu API lo requiere
            Swal.fire("¡Actualizado!", "El cliente ha sido actualizado con éxito.", "success");
        } else {
            await authAxios.post(apiUrl, data);
            Swal.fire("¡Creado!", "El cliente ha sido creado con éxito.", "success");
        }
        fetchClients(); // Volver a cargar los datos para reflejar los cambios
        closeModal();
    } catch (error) {
        handleAxiosError(error, "Error al guardar cliente", "No se pudo guardar el cliente. Verifica los datos e intenta de nuevo.");
    }
}

/**
 * Cambia el estado (activo/inactivo) de un cliente en la API.
 * @param {number} id - ID del cliente.
 * @param {boolean} activate - True para activar, false para desactivar.
 */
async function toggleClientStatus(id, activate) {
    const actionText = activate ? "activar" : "marcar como inactivo";
    const confirmButtonColor = activate ? "#28a745" : "#d33"; // Verde para activar, rojo para desactivar
    const successMessage = activate ? "El cliente ha sido activado." : "El cliente ha sido marcado como inactivo."; // Mensaje de éxito

    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `El cliente será ${actionText}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: confirmButtonColor,
        cancelButtonColor: "#3085d6",
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        try {
            const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token
            // Restaurada la URL original que tenías para el cambio de estado
            await authAxios.patch(`${apiUrl}/${id}/status/`, { active: activate });
            Swal.fire("Éxito", successMessage, "success"); // Usar el mensaje de éxito definido
            fetchClients(); // Volver a cargar los datos para reflejar el cambio de estado
        } catch (error) {
            handleAxiosError(error, "Error al cambiar estado del cliente", `No se pudo cambiar el estado del cliente.`);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el modal de Bootstrap
    const modalEl = document.getElementById("clientModal");
    if (modalEl) {
        clientModalInstance = new bootstrap.Modal(modalEl);
    } else {
        console.error("Elemento del modal #clientModal no encontrado.");
    }

    // Cargar clientes al inicio
    fetchClients();

    // Event listeners para filtros y búsqueda
    document.getElementById("statusFilter")?.addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });

    document.getElementById("searchInput")?.addEventListener('keyup', () => {
        currentPage = 1;
        renderTable();
    });

    // Event listener para el formulario de cliente
    document.getElementById("clientForm")?.addEventListener("submit", submitClient);

    // Event listener para el botón "Crear Cliente"
    // Asegurarse de que el botón que abre el modal sin datos esté correctamente asociado
    document.querySelector('[data-bs-target="#clientModal"]')
        ?.addEventListener('click', () => openClientModal());

    // Event listener para el toggle de la sidebar
    document.getElementById('sidebarToggle')
        ?.addEventListener('click', toggleSidebar);
});

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
