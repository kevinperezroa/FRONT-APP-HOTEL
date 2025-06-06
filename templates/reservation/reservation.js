let rooms = [];
let clients = [];
let reservationStatuses = [];
let reservations = [];
let users = [];

let currentPage = 1;
const pageSize = 20;

/**
 * Configura una instancia de Axios con el token de autenticación del localStorage.
 */
function getAuthAxios() {
    const token = localStorage.getItem("token");
    if (!token) {
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

async function fetchData() {
    try {
        const authAxios = getAuthAxios();
        const [usersResponse, clientsResponse, roomsResponse, statusResponse, reservationsResponse] = await Promise.all([
            authAxios.get("https://app-reservation-hotel-web.onrender.com/api/user"),
            authAxios.get("https://app-reservation-hotel-web.onrender.com/api/client"),
            authAxios.get("https://app-reservation-hotel-web.onrender.com/api/room"),
            authAxios.get("https://app-reservation-hotel-web.onrender.com/api/reservationstatus"),
            authAxios.get("https://app-reservation-hotel-web.onrender.com/api/reservations"),
        ]);

        users = usersResponse.data;
        clients = clientsResponse.data;
        rooms = roomsResponse.data;
        reservationStatuses = statusResponse.data;
        reservations = reservationsResponse.data;

        currentPage = 1;
        populateSelects();
        populateTables();
    } catch (error) {
        handleApiError(error);
    }
}

function handleApiError(error) {
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
                text: `Error ${error.response.status}: ${error.response.statusText || error.message}.`,
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } else if (error.request) {
        Swal.fire({
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor de la API.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    } else {
        Swal.fire({
            title: "Error inesperado",
            text: "Hubo un problema al configurar la solicitud.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

function populateSelects() {
    const userSelect = document.getElementById('user_id');
    const clientSelect = document.getElementById('client_id');
    const roomSelect = document.getElementById('room_id');
    const statusSelect = document.getElementById('reservation_status_id');

    userSelect.innerHTML = '<option value="">Seleccionar...</option>';
    clientSelect.innerHTML = '<option value="">Seleccionar...</option>';
    roomSelect.innerHTML = '<option value="">Seleccionar...</option>';
    statusSelect.innerHTML = '<option value="">Seleccionar...</option>';

    users.forEach(user => {
        userSelect.innerHTML += `<option value="${user.id}">${user.username}</option>`;
    });

    clients.forEach(client => {
        clientSelect.innerHTML += `<option value="${client.id}">${client.first_name} ${client.last_name}</option>`;
    });

    rooms.forEach(room => {
        roomSelect.innerHTML += `<option value="${room.id}">Habitación ${room.room_number}</option>`;
    });

    reservationStatuses.forEach(status => {
        statusSelect.innerHTML += `<option value="${status.id}">${status.name}</option>`;
    });
}

function populateTables() {
    const reservationTableBody = document.getElementById('reservationTableBody');
    reservationTableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedReservations = reservations.slice(startIndex, endIndex);

    paginatedReservations.forEach(reservation => {
        const user = users.find(u => u.id === reservation.user_id);
        const client = clients.find(c => c.id === reservation.client_id);
        const room = rooms.find(r => r.id === reservation.room_id);
        const status = reservationStatuses.find(s => s.id === reservation.reservation_status_id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reservation.id}</td>
            <td>${client ? client.first_name + " " + client.last_name : 'Desconocido'}</td>
            <td>${room ? room.room_number : 'Desconocido'}</td>
            <td>${reservation.check_in_date}</td>
            <td>${reservation.check_out_date}</td>
            <td>${reservation.total || 'N/A'}</td>
            <td>${status ? status.name : 'Desconocido'}</td>
            <td>${user ? user.username : 'Desconocido'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editReservation(${reservation.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReservation(${reservation.id})">Eliminar</button>
            </td>
        `;
        reservationTableBody.appendChild(tr);
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(reservations.length / pageSize);
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    // Botón Anterior
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<button class="page-link" aria-label="Anterior">«</button>`;
    prevItem.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            populateTables();
        }
    });
    paginationContainer.appendChild(prevItem);

    // Solo mostramos 2 botones numéricos por página
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link">${i}</button>`;
        li.addEventListener('click', () => {
            currentPage = i;
            populateTables();
        });
        paginationContainer.appendChild(li);
    }

    // Botón Siguiente
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<button class="page-link" aria-label="Siguiente">»</button>`;
    nextItem.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            populateTables();
        }
    });
    paginationContainer.appendChild(nextItem);
}


function openReservationModal() {
    document.getElementById('reservationId').value = '';
    document.getElementById('client_id').value = '';
    document.getElementById('room_id').value = '';
    document.getElementById('user_id').value = '';
    document.getElementById('reservation_status_id').value = '';
    document.getElementById('check_in_date').value = '';
    document.getElementById('check_out_date').value = '';
    document.getElementById('note').value = '';
    new bootstrap.Modal(document.getElementById('reservationModal')).show();
}

function editReservation(id) {
  const reservation = reservations.find(r => r.id === id);
  if (reservation) {
    document.getElementById('reservationId').value = reservation.id;
    document.getElementById('client_id').value = reservation.client_id;
    document.getElementById('room_id').value = reservation.room_id;
    document.getElementById('user_id').value = reservation.user_id;
    document.getElementById('reservation_status_id').value = reservation.reservation_status_id;
    document.getElementById('check_in_date').value = reservation.check_in_date;
    document.getElementById('check_out_date').value = reservation.check_out_date;
    document.getElementById('note').value = reservation.note;

    const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
    modal.show();
  }
}

async function deleteReservation(id) {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        try {
            const authAxios = getAuthAxios();
            await authAxios.delete(`https://app-reservation-hotel-web.onrender.com/api/reservations/${id}`);
            reservations = reservations.filter(r => r.id !== id);
            populateTables();
            Swal.fire("¡Eliminado!", "La reserva ha sido eliminada.", "success");
        } catch (error) {
            console.error("Error eliminando reserva:", error);
            Swal.fire("Error", "No se pudo eliminar la reserva.", "error");
        }
    }
}

function searchReservations() {
    const searchQuery = document.getElementById('searchClient').value.toLowerCase();
    fetchData().then(() => {
        reservations = reservations.filter(reservation => {
            const client = clients.find(c => c.id === reservation.client_id);
            return client && (client.first_name.toLowerCase().includes(searchQuery) || client.last_name.toLowerCase().includes(searchQuery));
        });
        currentPage = 1;
        populateTables();
    });
}

document.getElementById('reservationForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const reservationId = document.getElementById('reservationId').value;
    const reservationData = {
        client_id: document.getElementById('client_id').value,
        room_id: document.getElementById('room_id').value,
        reservation_status_id: document.getElementById('reservation_status_id').value,
        check_in_date: document.getElementById('check_in_date').value,
        check_out_date: document.getElementById('check_out_date').value,
        note: document.getElementById('note').value,
        user_id: document.getElementById('user_id').value,
    };

    const authAxios = getAuthAxios();

    try {
        if (reservationId) {
            const response = await authAxios.patch(`https://app-reservation-hotel-web.onrender.com/api/reservations/${reservationId}`, reservationData);
            const updatedReservation = response.data;
            const index = reservations.findIndex(r => r.id === updatedReservation.id);
            if (index !== -1) reservations[index] = updatedReservation;
        } else {
            const response = await authAxios.post(`https://app-reservation-hotel-web.onrender.com/api/reservations/`, reservationData);
            reservations.push(response.data);
        }
        document.getElementById('reservationModal').querySelector('.btn-close').click();
        currentPage = 1;
        populateTables();
        Swal.fire("¡Éxito!", "La reserva fue guardada correctamente.", "success");
    } catch (error) {
        console.error('Error al guardar reserva:', error);
        Swal.fire("Error", "No se pudo guardar la reserva.", "error");
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

document.addEventListener('DOMContentLoaded', fetchData);

document.getElementById('addReservationBtn')?.addEventListener('click', openReservationModal);
document.getElementById('searchClient')?.addEventListener('keyup', searchReservations);

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tu sesión actual se cerrará.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("token");
            Swal.fire({
                title: "Sesión cerrada",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = "/index.html";
            });
        }
    });
});
