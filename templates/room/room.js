let roomsData = [];
let typesData = [];
let statusesData = [];
let currentTypeFilter = "";
let currentActiveFilter = "";
let currentRoomStatusFilter = "";

let currentPage = 1;
const rowsPerPage = 10;

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
 * Obtiene todos los datos necesarios (habitaciones, tipos, estados de habitación)
 * de la API, utilizando el token de autenticación.
 * Si la sesión expira o no está autorizada (código de estado 401), redirige al login.
 */
async function fetchAllData() {
    try {
        const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token

        const [roomsRes, typesRes, statusesRes] = await Promise.all([
            authAxios.get("http://127.0.0.1:8000/api/room?page=1&limit=100"), // Asegúrate de manejar la paginación si tu API la implementa
            authAxios.get("http://127.0.0.1:8000/api/roomtypes/"),
            authAxios.get("http://127.0.0.1:8000/api/roomstatus/")
        ]);

        roomsData = roomsRes.data;
        typesData = typesRes.data;
        statusesData = statusesRes.data;

        populateFilterOptions(typesData, "filterRoomType", "Filtrar por Tipo");
        populateFilterOptions(statusesData, "filterRoomStatusType", "Filtrar por Estado de Habitación");

        populateSelectOptions(typesData, "room_type_id");
        populateSelectOptions(statusesData, "room_status_id");

        // Al cargar todos los datos, aplicar filtros y renderizar la primera página
        applyAllFilters();
    } catch (error) {
        console.error("Error cargando datos:", error);

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
                    title: "Error de la API",
                    text: `El servidor respondió con un error ${error.response.status}: ${error.response.statusText || error.message}. Verifica la consola para más detalles.`,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        } else if (error.request) {
            Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor de la API. Asegúrate de que el backend esté corriendo y sea accesible. Verifica la consola para posibles errores de CORS.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        } else {
            Swal.fire({
                title: "Error inesperado",
                text: "Hubo un problema al configurar la solicitud. Verifica la consola para más detalles.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    }
}

function filterByType() {
    currentTypeFilter = document.getElementById("filterRoomType").value;
    currentPage = 1; // Reinicia a la página 1 cuando el filtro cambia
    applyAllFilters();
}

function filterByActive() {
    currentActiveFilter = document.getElementById("filterRoomStatus").value;
    currentPage = 1; // Reinicia a la página 1 cuando el filtro cambia
    applyAllFilters();
}

function filterByRoomStatusType() {
    currentRoomStatusFilter = document.getElementById("filterRoomStatusType").value;
    currentPage = 1; // Reinicia a la página 1 cuando el filtro cambia
    applyAllFilters();
}

function applyAllFilters() {
    const filtered = roomsData.filter(room => {
        const matchType = currentTypeFilter ? room.room_type_id == currentTypeFilter : true;
        const matchActive = currentActiveFilter !== "" ? String(room.active) === currentActiveFilter : true;
        const matchStatus = currentRoomStatusFilter ? room.room_status_id == currentRoomStatusFilter : true;
        return matchType && matchActive && matchStatus;
    });

    renderRooms(filtered);
    renderPagination(filtered);
}

function populateFilterOptions(data, elementId, placeholder) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

function populateSelectOptions(data, elementId) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="">Seleccione una opción</option>`;
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

function renderRooms(rooms) {
    const tbody = document.getElementById("roomTableBody");
    tbody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const roomsToShow = rooms.slice(startIndex, endIndex);

    roomsToShow.forEach(room => {
        const precio = parseFloat(room.price_per_night);
        const precioFormateado = isNaN(precio) ? "N/A" : `$${precio.toFixed(2)}`;
        const typeName = findNameById(room.room_type_id, typesData);
        const statusName = findNameById(room.room_status_id, statusesData);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${room.room_number}</td>
            <td>${precioFormateado}</td>
            <td>${room.capacity}</td>
            <td>${typeName}</td>
            <td>${statusName}</td>
            <td>
                <span class="badge bg-${room.active ? "success" : "secondary"}">
                    ${room.active ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick='editRoom(${JSON.stringify(room)})'>
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-${room.active ? "danger" : "success"}" onclick='toggleRoomStatus(${room.id}, ${!room.active})'>
                    <i class="bi bi-${room.active ? "x-circle" : "check-circle"}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderPagination(rooms) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(rooms.length / rowsPerPage);

    const prevButton = document.createElement("button");
    prevButton.className = "btn btn-outline-secondary mx-1";
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1);
    pagination.appendChild(prevButton); // Añadir al principio

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.className = "btn btn-outline-primary mx-1";
        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("active", "fw-bold");
            button.disabled = true;
        }

        button.onclick = () => goToPage(i);
        pagination.appendChild(button);
    }

    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-outline-secondary mx-1";
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    pagination.appendChild(nextButton); // Añadir al final
}

function goToPage(page) {
    currentPage = page;
    applyAllFilters(); // Re-aplicar filtros para renderizar la página correcta
}

function findNameById(id, dataList) {
    const item = dataList.find(item => item.id === id);
    return item ? item.name : "N/A";
}

function openRoomModal() {
    document.getElementById("roomForm").reset();
    document.getElementById("roomId").value = "";
    const modal = new bootstrap.Modal(document.getElementById("roomModal"));
    modal.show();
}

async function saveRoom(event) {
    event.preventDefault();

    const id = document.getElementById("roomId").value;

    const roomData = {
        room_number: document.getElementById("room_number").value,
        price_per_night: parseFloat(document.getElementById("price_per_night").value),
        capacity: parseInt(document.getElementById("capacity").value),
        room_type_id: parseInt(document.getElementById("room_type_id").value),
        room_status_id: parseInt(document.getElementById("room_status_id").value)
    };

    try {
        const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token

        if (id) {
            await authAxios.patch(`http://127.0.0.1:8000/api/room/${id}`, roomData);
            Swal.fire(
                "¡Actualizado!",
                "La habitación ha sido actualizada con éxito.",
                "success"
            );
        } else {
            await authAxios.post("http://127.0.0.1:8000/api/room", roomData);
            Swal.fire(
                "¡Creado!",
                "La habitación ha sido creada con éxito.",
                "success"
            );
        }

        bootstrap.Modal.getInstance(document.getElementById("roomModal")).hide();
        fetchAllData(); // Vuelve a cargar todos los datos para reflejar los cambios
    } catch (error) {
        console.error("Error al guardar habitación:", error);
        if (error.response) {
            Swal.fire(
                "Error al guardar",
                `El servidor respondió con un error ${error.response.status}: ${error.response.data.message || error.message}.`,
                "error"
            );
        } else {
            Swal.fire(
                "Error de conexión",
                "No se pudo guardar la habitación. Verifica tu conexión o el servidor.",
                "error"
            );
        }
    }
}

function editRoom(room) {
    document.getElementById("roomId").value = room.id;
    document.getElementById("room_number").value = room.room_number;
    document.getElementById("price_per_night").value = room.price_per_night;
    document.getElementById("capacity").value = room.capacity;
    document.getElementById("room_type_id").value = room.room_type_id || "";
    document.getElementById("room_status_id").value = room.room_status_id || "";

    const modal = new bootstrap.Modal(document.getElementById("roomModal"));
    modal.show();
}

async function toggleRoomStatus(id, activate) {
    const actionText = activate ? "activar" : "marcar como inactiva";
    const confirmText = activate ? "Sí, activar" : "Sí, marcar como inactivo";
    const successMessage = activate ? "La habitación ha sido activada." : "La habitación ha sido marcada como inactiva.";

    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `La habitación será ${actionText}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: activate ? "#28a745" : "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: confirmText,
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        try {
            const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token
            await authAxios.patch(`http://127.0.0.1:8000/api/room/${id}/status`, { active: activate });
            Swal.fire("Éxito", successMessage, "success");
            fetchAllData(); // Vuelve a cargar los datos para reflejar el cambio de estado
        } catch (error) {
            console.error("Error al cambiar estado de la habitación:", error);
            if (error.response) {
                Swal.fire(
                    "Error",
                    `No se pudo cambiar el estado de la habitación. Error: ${error.response.status}.`,
                    "error"
                );
            } else {
                Swal.fire(
                    "Error de conexión",
                    "No se pudo conectar con el servidor para cambiar el estado.",
                    "error"
                );
            }
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

// Llama a la función fetchAllData al cargar la página para inicializar los datos
document.addEventListener("DOMContentLoaded", () => {
    fetchAllData();

    document.getElementById("roomForm").addEventListener("submit", saveRoom);

    document.getElementById("filterRoomType").addEventListener("change", filterByType);
    document.getElementById("filterRoomStatus").addEventListener("change", filterByActive);
    document.getElementById("filterRoomStatusType").addEventListener("change", filterByRoomStatusType);
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
