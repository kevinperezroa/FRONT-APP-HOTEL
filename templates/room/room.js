document.addEventListener("DOMContentLoaded", () => {
    fetchAllData();

    document.getElementById("roomForm").addEventListener("submit", saveRoom);

    document.getElementById("filterRoomType").addEventListener("change", filterByType);
    document.getElementById("filterRoomStatus").addEventListener("change", filterByActive);
    document.getElementById("filterRoomStatusType").addEventListener("change", filterByRoomStatusType);
});


let roomsData = [];
let typesData = [];
let statusesData = [];
let currentTypeFilter = "";
let currentActiveFilter = "";
let currentRoomStatusFilter = "";


let currentPage = 1;
const rowsPerPage = 10;


async function fetchAllData() {
    try {
        const [roomsRes, typesRes, statusesRes] = await Promise.all([
            axios.get("http://127.0.0.1:8000/api/room?page=1&limit=100"),
            axios.get("http://127.0.0.1:8000/api/roomtypes/"),
            axios.get("http://127.0.0.1:8000/api/roomstatus/")
        ]);

        roomsData = roomsRes.data;
        typesData = typesRes.data;
        statusesData = statusesRes.data;

        populateFilterOptions(typesData, "filterRoomType", "Filtrar por Tipo");
        populateFilterOptions(statusesData, "filterRoomStatusType", "Filtrar por Estado de Habitación");

        populateSelectOptions(typesData, "room_type_id");
        populateSelectOptions(statusesData, "room_status_id");

        renderRooms(roomsData);
        renderPagination(roomsData);
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

function filterByType() {
    currentTypeFilter = document.getElementById("filterRoomType").value;
    applyAllFilters();
}

function filterByActive() {
    currentActiveFilter = document.getElementById("filterRoomStatus").value;
    applyAllFilters();
}

function filterByRoomStatusType() {
    currentRoomStatusFilter = document.getElementById("filterRoomStatusType").value;
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


const prevButton = document.createElement("button");
prevButton.className = "btn btn-outline-secondary mx-1";
prevButton.innerHTML = '&laquo;'; 
prevButton.disabled = currentPage === 1; 
prevButton.onclick = () => goToPage(currentPage - 1);
pagination.insertBefore(prevButton, pagination.firstChild);

const nextButton = document.createElement("button");
nextButton.className = "btn btn-outline-secondary mx-1";
nextButton.innerHTML = '&raquo;'; 
nextButton.disabled = currentPage === totalPages; 
pagination.appendChild(nextButton);

}


function goToPage(page) {
    currentPage = page;
    applyAllFilters();
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
        if (id) {
            await axios.patch(`http://127.0.0.1:8000/api/room/${id}`, roomData);
        } else {
            await axios.post("http://127.0.0.1:8000/api/room", roomData);
        }

        bootstrap.Modal.getInstance(document.getElementById("roomModal")).hide();
        fetchAllData();
    } catch (error) {
        console.error("Error al guardar habitación:", error);
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
    const actionText = activate ? "activar" : "marcar como inactivo";
    const confirmText = activate ? "Sí, activar" : "Sí, marcar como inactivo";
    const successMessage = activate ? "La habitación ha sido activada." : "La habitación ha sido marcada como inactiva.";


    Swal.fire({
        title: "¿Estás seguro?",
        text: `La habitación será ${actionText}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: activate ? "#28a745" : "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: confirmText,
    }).then((result) => {
        if (result.isConfirmed) {
            axios
                .patch(`http://127.0.0.1:8000/api/room/${id}/status`, { active: activate })
                .then(() => {
                    Swal.fire("Éxito", successMessage, "success");
                    fetchAllData();
                })
                .catch((error) => {
                    console.error("Error al cambiar estado de la habitación:", error);
                    Swal.fire("Error", "No se pudo cambiar el estado de la habitación.", "error");
                });
        }
    });
}
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}
