const apiUrl = "https://app-reservation-hotel-web.onrender.com/api/client";
const rowsPerPage = 12;
let currentPage = 1;
let clients = [];

function fetchClients() {
    axios.get(apiUrl).then(res => {
        clients = res.data;
        renderTable();
        renderPagination();
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

function getFilteredClients() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(c => c.number_identification.toLowerCase().includes(query));
}

function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = "";

    const filtered = getFilteredClients();
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    paginated.forEach(client => {
        tbody.innerHTML += `
                        <tr>
                            <td>${client.id}</td>
                            <td>${client.first_name}</td>
                            <td>${client.last_name}</td>
                            <td>${client.phone}</td>
                            <td>${client.email}</td>
                            <td>${client.number_identification}</td>
                            <td>
                                <button class="btn btn-sm btn-custom me-1" onclick='openEditModal(${JSON.stringify(client)})'>Editar</button>
                                <button class="btn btn-sm btn-custom" onclick='deleteClient(${client.id})'>Eliminar</button>
                            </td>
                        </tr>`;
    });

    renderPagination(filtered.length);
}

function renderPagination(total = null) {
    const filtered = total ?? getFilteredClients().length;
    const pageCount = Math.ceil(filtered / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= pageCount; i++) {
        pagination.innerHTML += `
                        <li class="page-item ${i === currentPage ? "active" : ""}">
                            <button class="page-link btn-custom" onclick="goToPage(${i})">${i}</button>
                        </li>`;
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function openCreateModal() {
    document.getElementById("modalTitle").innerText = "Crear Cliente";
    document.getElementById("clientId").value = "";
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("identification").value = "";
}

function openEditModal(client) {
    document.getElementById("modalTitle").innerText = "Editar Cliente";
    document.getElementById("clientId").value = client.id;
    document.getElementById("firstName").value = client.first_name;
    document.getElementById("lastName").value = client.last_name;
    document.getElementById("phone").value = client.phone;
    document.getElementById("email").value = client.email;
    document.getElementById("identification").value = client.number_identification;
    new bootstrap.Modal(document.getElementById('clientModal')).show();
}

function submitClient(e) {
    e.preventDefault();
    const id = document.getElementById("clientId").value;
    const data = {
        first_name: document.getElementById("firstName").value,
        last_name: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        number_identification: document.getElementById("identification").value,
    };

    const closeModal = () => bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();

    if (id) {
        axios.patch(`${apiUrl}/${id}`, data)
            .then(() => { fetchClients(); closeModal(); })
            .catch(err => alert(err.response.data.detail));
    } else {
        axios.post(apiUrl, data)
            .then(() => { fetchClients(); closeModal(); })
            .catch(err => alert(err.response.data.detail));
    }
}

function deleteClient(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        axios.delete(`${apiUrl}/${id}`).then(() => fetchClients());
    }
}

document.addEventListener("DOMContentLoaded", fetchClients);