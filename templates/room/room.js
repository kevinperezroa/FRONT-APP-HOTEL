let rooms = [];
let roomTypes = [];
let roomStatuses = [];

async function fetchData() {
    try {
        const response = await axios.get('https://app-reservation-hotel-web.onrender.com/api/room');
        rooms = response.data.rooms;
        roomTypes = response.data.room_types;
        roomStatuses = response.data.room_statuses;
        populateSelectOptions("room_type_id", roomTypes);
        populateSelectOptions("room_status_id", roomStatuses);
        populateSelectOptions("filterRoomType", roomTypes, true);
        populateSelectOptions("filterRoomStatus", roomStatuses, true);
        renderRooms();
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

function populateSelectOptions(selectId, items, includeEmpty = false) {
    const select = document.getElementById(selectId);
    select.innerHTML = includeEmpty ? `<option value="">Todos</option>` : `<option value="">Selecciona una opción</option>`;
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

function renderRooms() {
    const container = document.getElementById("roomContainer");
    container.innerHTML = "";
    const typeFilter = document.getElementById("filterRoomType").value;
    const statusFilter = document.getElementById("filterRoomStatus").value;
    const filtered = rooms.filter(room => {
        return (!typeFilter || room.room_type_id == typeFilter) &&
            (!statusFilter || room.room_status_id == statusFilter);
    });

    filtered.forEach(room => {
        const roomType = roomTypes.find(t => t.id === room.room_type_id)?.name || '';
        const roomStatus = roomStatuses.find(s => s.id === room.room_status_id)?.name || '';
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
      <div class="card card-custom">
        <div class="card-body">
          <h5 class="card-title">Habitación ${room.room_number}</h5>
          <p class="card-text">Precio: $${room.price_per_night}</p>
          <p class="card-text">Capacidad: ${room.capacity}</p>
          <p class="card-text">Tipo: ${roomType}</p>
          <p class="card-text">Estado: ${roomStatus}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary" onclick="openUpdateRoomModal(${room.id})">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>`;
        container.appendChild(card);
    });
}

function openRoomModal() {
    document.getElementById("roomForm").reset();
    document.getElementById("roomId").value = "";
    const modal = new bootstrap.Modal(document.getElementById("roomModal"));
    modal.show();
}

function openUpdateRoomModal(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    document.getElementById("roomId").value = room.id;
    document.getElementById("room_number").value = room.room_number;
    document.getElementById("price_per_night").value = room.price_per_night;
    document.getElementById("capacity").value = room.capacity;
    document.getElementById("room_type_id").value = room.room_type_id;
    document.getElementById("room_status_id").value = room.room_status_id;

    const modal = new bootstrap.Modal(document.getElementById("roomModal"));
    modal.show();
}

document.getElementById("roomForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("roomId").value;
    const data = {
        room_number: document.getElementById("room_number").value,
        price_per_night: parseFloat(document.getElementById("price_per_night").value),
        capacity: parseInt(document.getElementById("capacity").value),
        room_type_id: parseInt(document.getElementById("room_type_id").value),
        room_status_id: parseInt(document.getElementById("room_status_id").value),
    };

    try {
        if (id) {
            await axios.patch(`https://app-reservation-hotel-web.onrender.com/api/room${id}`, data);
        } else {
            await axios.post("https://app-reservation-hotel-web.onrender.com/api/room", data);
        }
        await fetchData();
        bootstrap.Modal.getInstance(document.getElementById("roomModal")).hide();
    } catch (err) {
        console.error("Error guardando habitación:", err);
    }
});

async function deleteRoom(id) {
    if (confirm("¿Estás seguro de eliminar esta habitación?")) {
        try {
            await axios.delete(`https://app-reservation-hotel-web.onrender.com/api/room${id}`);
            await fetchData();
        } catch (err) {
            console.error("Error al eliminar habitación:", err);
        }
    }
}

document.getElementById("filterRoomType").addEventListener("change", renderRooms);
document.getElementById("filterRoomStatus").addEventListener("change", renderRooms);

window.onload = fetchData;