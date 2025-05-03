const apiUrl = "http://127.0.0.1:8000/api/client";
const rowsPerPage = 12;
let currentPage = 1;
let clients = [];
let clientModalInstance;

function fetchClients() {
    axios.get(apiUrl).then(res => {
        clients = res.data.map(c => ({ ...c, active: Boolean(c.active) }));
        renderTable();
        renderPagination(getFilteredClients().length);
    }).catch(handleError);
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
        const matchesQuery =
            c.first_name.toLowerCase().includes(query) ||
            c.last_name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.number_identification.toLowerCase().includes(query);

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

    const currentFilter = document.getElementById("statusFilter").value;

    paginated.forEach(client => {
        const estadoTexto = client.active ? "Activo" : "Inactivo";
        const estadoClase = client.active ? "text-success" : "text-danger";

        const actionBtn = currentFilter === "inactive"
            ? `<button class="btn btn-sm btn-success" onclick='toggleClientStatus(${client.id}, true)'>Activar</button>`
            : `<button class="btn btn-sm btn-danger" onclick='toggleClientStatus(${client.id}, false)'>Eliminar</button>`;

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

function openClientModal(client = {}) {
    document.getElementById("modalTitle").innerText = client.id ? "Editar Cliente" : "Crear Cliente";
    document.getElementById("clientId").value = client.id || "";
    document.getElementById("firstName").value = client.first_name || "";
    document.getElementById("lastName").value = client.last_name || "";
    document.getElementById("phone").value = client.phone || "";
    document.getElementById("email").value = client.email || "";
    document.getElementById("identification").value = client.number_identification || "";
    clientModalInstance.show();
}

function openEditModal(client) {
    openClientModal(client);
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

    const closeModal = () => {
        document.activeElement.blur();
        setTimeout(() => {
            clientModalInstance.hide();
        }, 10);
    };

    if (id) {
        axios.patch(`${apiUrl}/${id}`, data)
            .then(() => { fetchClients(); closeModal(); })
            .catch(handleError);
    } else {
        axios.post(apiUrl, data)
            .then(() => { fetchClients(); closeModal(); })
            .catch(handleError);
    }
}

function toggleClientStatus(id, activate) {
    const actionText = activate ? "activar" : "marcar como inactivo";
    const confirmText = activate ? "Sí, activar" : "Sí, marcar como inactivo";
    const successMessage = activate ? "El cliente ha sido activado." : "El cliente ha sido marcado como inactivo.";

    Swal.fire({
        title: "¿Estás seguro?",
        text: `El cliente será ${actionText}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: activate ? "#28a745" : "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: confirmText,
    }).then((result) => {
        if (result.isConfirmed) {
            axios
                .patch(`${apiUrl}/${id}/status`, { active: activate })
                .then(() => {
                    Swal.fire("Éxito", successMessage, "success");
                    fetchClients();
                })
                .catch((error) => {
                    console.error("Error al cambiar estado del cliente:", error);
                    Swal.fire("Error", "No se pudo cambiar el estado del cliente.", "error");
                });
        }
    });
}

function handleError(err) {
    const errorMessage = err.response?.data?.detail || 'Error desconocido';
    alert(`Ha ocurrido un error: ${errorMessage}`);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchClients();
    const modalEl = document.getElementById("clientModal");
    clientModalInstance = new bootstrap.Modal(modalEl);

    document.getElementById("statusFilter").addEventListener("change", () => {
        currentPage = 1;
        renderTable();
    });
});
