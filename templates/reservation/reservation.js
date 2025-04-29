const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is ready!");
    loadReservations();
    loadSelectOptions();
    document.getElementById("reservationForm").addEventListener("submit", saveReservation);
});

async function loadReservations() {
    const tbody = document.getElementById("reservationTableBody");
    if (!tbody) {
        console.error("Error: Element with id 'reservationTableBody' not found!");
        return;
    }

    try {
        console.log("Fetching reservations from:", `${API_URL}/reservations`);
        const response = await axios.get(`${API_URL}/reservations`);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        tbody.innerHTML = "";

        if (response.data && Array.isArray(response.data)) {
            if (response.data.length === 0) {
                tbody.innerHTML = "<tr><td colspan='8'>No se encontraron reservas.</td></tr>";
                return;
            }
            response.data.forEach(reservation => {
                const checkInDate = new Date(reservation.check_in_date).toLocaleDateString();
                const checkOutDate = new Date(reservation.check_in_out).toLocaleDateString();
                const totalFormatted = (typeof reservation.total === 'number' ? reservation.total.toFixed(2) : '0.00');

                const row = `
                    <tr>
                        <td>${reservation.id}</td>
                        <td>${reservation.client_id}</td>
                        <td>${reservation.room_id}</td>
                        <td>${checkInDate}</td>
                        <td>${checkOutDate}</td>
                        <td>$${totalFormatted}</td>
                        <td>${reservation.reservation_status_id}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editReservation(${reservation.id})"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="deleteReservation(${reservation.id})"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML("beforeend", row);
            });
        } else {
            console.warn("La API devolvió una respuesta inesperada:", response);
            tbody.innerHTML = "<tr><td colspan='8'>Error: La API devolvió datos en un formato incorrecto.</td></tr>";
        }
    } catch (error) {
        console.error("Error al cargar reservas:", error);
        tbody.innerHTML = "<tr><td colspan='8' class='text-danger'>Error al cargar las reservas. Por favor, inténtelo de nuevo más tarde.</td></tr>";
    }
}

async function saveReservation(event) {
    event.preventDefault();

    const id = document.getElementById("reservationId").value;
    const reservationData = {
        client_id: parseInt(document.getElementById("client_id").value),
        room_id: parseInt(document.getElementById("room_id").value),
        user_id: parseInt(document.getElementById("user_id").value),
        reservation_status_id: parseInt(document.getElementById("reservation_status_id").value),
        check_in_date: document.getElementById("check_in_date").value,
        check_in_out: document.getElementById("check_in_out").value,
        note: document.getElementById("note").value
    };

    try {
        if (id) {
            await axios.patch(`${API_URL}/reservations/${id}`, reservationData);
        } else {
            await axios.post(`${API_URL}/reservations/`, reservationData);
        }

        bootstrap.Modal.getInstance(document.getElementById("reservationModal")).hide();
        loadReservations();
        document.getElementById("reservationForm").reset();
    } catch (error) {
        console.error("Error al guardar la reserva:", error);
        alert("Ocurrió un error al guardar la reserva. Por favor, revisa los datos e inténtalo de nuevo.");
    }
}

async function editReservation(id) {
    try {
        const response = await axios.get(`${API_URL}/reservations/${id}`);
        const data = response.data;

        document.getElementById("reservationId").value = data.id;
        document.getElementById("client_id").value = data.client_id;
        document.getElementById("room_id").value = data.room_id;
        document.getElementById("user_id").value = data.user_id;
        document.getElementById("reservation_status_id").value = data.reservation_status_id;
        document.getElementById("check_in_date").value = data.check_in_date;
        document.getElementById("check_in_out").value = data.check_in_out;
        document.getElementById("note").value = data.note;

        new bootstrap.Modal(document.getElementById("reservationModal")).show();
    } catch (error) {
        console.error("Error al obtener datos de la reserva:", error);
        alert("Ocurrió un error al cargar los datos de la reserva para editar.");
    }
}

async function deleteReservation(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta reserva?")) {
        try {
            await axios.delete(`${API_URL}/reservations/${id}`);
            loadReservations();
        } catch (error) {
            console.error("Error al eliminar reserva:", error);
            alert("Ocurrió un error al eliminar la reserva.");
        }
    }
}

function openReservationModal() {
    document.getElementById("reservationForm").reset();
    document.getElementById("reservationId").value = "";
    new bootstrap.Modal(document.getElementById("reservationModal")).show();
}

async function loadSelectOptions() {
    const endpoints = {
        client_id: "/client",
        room_id: "/room",
        user_id: "/user",
        reservation_status_id: "/reservationstatus"
    };

    for (const [selectId, endpoint] of Object.entries(endpoints)) {
        try {
            const url = `${API_URL}${endpoint}`;
            console.log(`Fetching options for ${selectId} from: ${url}`);
            const response = await axios.get(url);
            console.log(`Response status for ${selectId}:`, response.status);
            console.log(`Response data for ${selectId}:`, response.data);

            const select = document.getElementById(selectId);
            if (!select) {
                console.error(`Elemento select con id '${selectId}' no encontrado.`);
                continue;
            }

            select.innerHTML = '<option value="">Seleccione una opción</option>';

            if (response.data && Array.isArray(response.data)) {
                response.data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    const label = item.name || item.room_number || item.username || item.status || `ID: ${item.id}`;
                    option.textContent = label;
                    select.appendChild(option);
                });
            } else {
                console.warn(`La API devolvió una respuesta inesperada para ${selectId}:`, response);
            }
        } catch (error) {
            console.error(`Error cargando opciones para ${selectId}:`, error);
            alert(`Ocurrió un error al cargar las opciones para el campo ${selectId}. Por favor, revisa la consola para más detalles.`);
        }
    }
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("main-content").classList.toggle("expanded");
}
