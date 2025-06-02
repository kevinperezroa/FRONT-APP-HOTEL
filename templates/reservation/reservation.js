let rooms = [];
let clients = [];
let reservationStatuses = [];
let reservations = [];
let users = [];

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


async function fetchData() {
    try {
        const authAxios = getAuthAxios(); // Obtener la instancia de Axios con el token

        const [usersResponse, clientsResponse, roomsResponse, statusResponse, reservationsResponse] = await Promise.all([
            authAxios.get("http://127.0.0.1:8000/api/user"),
            authAxios.get("http://127.0.0.1:8000/api/client"),
            authAxios.get("http://127.0.0.1:8000/api/room"),
            authAxios.get("http://127.0.0.1:8000/api/reservationstatus"),
            authAxios.get("http://127.0.0.1:8000/api/reservations"),
        ]);

        users = usersResponse.data;
        clients = clientsResponse.data;
        rooms = roomsResponse.data;
        reservationStatuses = statusResponse.data;
        reservations = reservationsResponse.data;

        populateTables();
        populateSelects();
    } catch (error) {
        console.error("Error al obtener los datos:", error); // Esto te dará detalles en la consola del navegador

        if (error.response) {
            // El servidor respondió con un código de estado de error (ej. 400, 403, 500)
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
                // Otros errores de respuesta del servidor (ej. 400 Bad Request, 500 Internal Server Error)
                Swal.fire({
                    title: "Error de la API",
                    text: `El servidor respondió con un error ${error.response.status}: ${error.response.statusText || error.message}. Verifica la consola para más detalles.`,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta (ej. servidor caído, problema de red/CORS)
            Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor de la API. Asegúrate de que el backend esté corriendo y sea accesible. Verifica la consola para posibles errores de CORS.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        } else {
            // Algo más causó el error (ej. error en la configuración de la solicitud)
            Swal.fire({
                title: "Error inesperado",
                text: "Hubo un problema al configurar la solicitud. Verifica la consola para más detalles.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    }
}


/**
 * Rellena los selectores de los formularios con los datos obtenidos.
 */
function populateSelects() {
    const userSelect = document.getElementById('user_id');
    const clientSelect = document.getElementById('client_id');
    const roomSelect = document.getElementById('room_id');
    const statusSelect = document.getElementById('reservation_status_id');

    // Limpiar selectores antes de añadir opciones
    userSelect.innerHTML = '<option value="">Seleccionar...</option>';
    clientSelect.innerHTML = '<option value="">Seleccionar...</option>';
    roomSelect.innerHTML = '<option value="">Seleccionar...</option>';
    statusSelect.innerHTML = '<option value="">Seleccionar...</option>';

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        userSelect.appendChild(option);
    });

    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.first_name} ${client.last_name}`;
        clientSelect.appendChild(option);
    });

    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `Habitación ${room.room_number}`;
        roomSelect.appendChild(option);
    });

    reservationStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.name;
        statusSelect.appendChild(option);
    });
}

/**
 * Rellena la tabla de reservas con los datos obtenidos.
 */
function populateTables() {
    const reservationTableBody = document.getElementById('reservationTableBody');
    reservationTableBody.innerHTML = ''; // Limpiar tabla antes de añadir filas

    reservations.forEach(reservation => {
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
}

/**
 * Abre el modal para crear una nueva reserva, reseteando los campos del formulario.
 */
function openReservationModal() {
    // Limpiar todos los campos del formulario
    document.getElementById('reservationId').value = '';
    document.getElementById('client_id').value = '';
    document.getElementById('room_id').value = '';
    document.getElementById('user_id').value = '';
    document.getElementById('reservation_status_id').value = '';
    document.getElementById('check_in_date').value = '';
    document.getElementById('check_out_date').value = '';
    document.getElementById('note').value = '';

    const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
    modal.show();
}

/**
 * Rellena el formulario del modal con los datos de una reserva existente para su edición.
 * @param {number} id El ID de la reserva a editar.
 */
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
    } else {
        Swal.fire({
            title: "Error",
            text: "Reserva no encontrada.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

/**
 * Elimina una reserva de la base de datos y actualiza la tabla.
 * @param {number} id El ID de la reserva a eliminar.
 */
async function deleteReservation(id) {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        try {
            const authAxios = getAuthAxios();
            await authAxios.delete(`http://127.0.0.1:8000/api/reservations/${id}`);
            reservations = reservations.filter(r => r.id !== id);
            populateTables();
            Swal.fire(
                "¡Eliminado!",
                "La reserva ha sido eliminada.",
                "success"
            );
        } catch (error) {
            console.error("Error eliminando reserva:", error);
            Swal.fire(
                "Error",
                "Error al eliminar la reserva. Consulta la consola para más detalles.",
                "error"
            );
        }
    }
}

/**
 * Filtra las reservas mostradas en la tabla basándose en el nombre o apellido del cliente.
 */
function searchReservations() {
    const searchQuery = document.getElementById('searchClient').value.toLowerCase();
    // Vuelve a cargar todos los datos para asegurar que la búsqueda se realiza sobre el conjunto completo
    fetchData().then(() => {
        const filteredReservations = reservations.filter(reservation => {
            const client = clients.find(c => c.id === reservation.client_id);
            return client && (client.first_name.toLowerCase().includes(searchQuery) || client.last_name.toLowerCase().includes(searchQuery));
        });
        // Reemplaza las reservas con las filtradas para la visualización
        reservations = filteredReservations;
        populateTables();
    });
}

/**
 * Maneja el envío del formulario de reservas, ya sea para crear o editar una reserva.
 */
document.getElementById('reservationForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Previene que el formulario se envíe y recargue la página.

    const reservationId = document.getElementById('reservationId').value;
    const clientId = document.getElementById('client_id').value;
    const roomId = document.getElementById('room_id').value;
    const userId = document.getElementById('user_id').value;
    const reservationStatusId = document.getElementById('reservation_status_id').value;
    const checkInDate = document.getElementById('check_in_date').value;
    const checkOutDate = document.getElementById('check_out_date').value;
    const note = document.getElementById('note').value;

    const reservationData = {
        client_id: clientId,
        room_id: roomId,
        reservation_status_id: reservationStatusId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        note: note,
        user_id: userId,
    };

    const authAxios = getAuthAxios(); // Obtén la instancia de Axios con el token

    try {
        if (reservationId) {
            // Si hay ID, es una edición
            const response = await authAxios.patch(`http://127.0.0.1:8000/api/reservations/${reservationId}`, reservationData);
            const updatedReservation = response.data;
            const index = reservations.findIndex(r => r.id === updatedReservation.id);
            if (index !== -1) {
                reservations[index] = updatedReservation;
            }
            populateTables(); // Recarga las reservas en la tabla
            document.getElementById('reservationModal').querySelector('.btn-close').click(); // Cierra el modal
            Swal.fire(
                "¡Actualizado!",
                "La reserva ha sido actualizada con éxito.",
                "success"
            );
        } else {
            // Si no hay ID, es una creación
            const response = await authAxios.post('http://127.0.0.1:8000/api/reservations/', reservationData);
            reservations.push(response.data); // Agrega la nueva reserva
            populateTables(); // Recarga las reservas en la tabla
            document.getElementById('reservationModal').querySelector('.btn-close').click(); // Cierra el modal
            Swal.fire(
                "¡Creado!",
                "La reserva ha sido creada con éxito.",
                "success"
            );
        }
    } catch (error) {
        console.error('Error al guardar reserva:', error);
        Swal.fire(
            "Error",
            "Hubo un error al guardar la reserva. Consulta la consola para más detalles.",
            "error"
        );
    }
});

/**
 * Alterna la visibilidad de la barra lateral y ajusta el contenido principal.
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

// Llama a la función fetchData al cargar la página para inicializar los datos
document.addEventListener('DOMContentLoaded', fetchData);

// Asocia la función openReservationModal al botón de añadir (si existe)
const addReservationButton = document.getElementById('addReservationBtn');
if (addReservationButton) {
    addReservationButton.addEventListener('click', openReservationModal);
}

// Asocia la función searchReservations al campo de búsqueda (si existe)
const searchClientInput = document.getElementById('searchClient');
if (searchClientInput) {
    searchClientInput.addEventListener('keyup', searchReservations);
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
