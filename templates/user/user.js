document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://127.0.0.1:8000/api/user/";
  let users = [];

  
  const userForm = document.getElementById("userForm");
  const userModal = new bootstrap.Modal(document.getElementById("userModal"));
  const statusFilter = document.getElementById("statusFilter");
  const togglePasswordButton = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  // Obtener usuarios
  async function fetchUsers() {
    try {
      const response = await axios.get(apiUrl);
      users = response.data;
      renderFilteredUsers();
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
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
    const container = document.getElementById("userTableBody");  // <-- ID correcto
    if (!container) {
      console.error("Elemento userTableBody no encontrado.");
      return;
    }

    container.innerHTML = "";
    filtered.forEach((u) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.user_type_id === 1 ? "Administrador" : "Usuario normal"}</td>
        <td>${u.active ? "Activo" : "Inactivo"}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editUser(${u.id})">
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
      const { data } = await axios.get(`${apiUrl}${id}`);
      document.getElementById("userId").value = data.id;
      document.getElementById("username").value = data.username;
      document.getElementById("email").value = data.email;
      document.getElementById("password").value = "";
      document.getElementById("user_type_id").value = data.user_type_id;
      userModal.show();
    } catch (error) {
      console.error("Error al editar usuario:", error);
    }
  };

  // Cambiar estado del usuario
  window.toggleUserStatus = async function (id, currentStatus) {
    const confirmed = await Swal.fire({
      title: currentStatus ? "¿Inactivar usuario?" : "¿Activar usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar"
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.patch(`${apiUrl}${id}`, { active: !currentStatus });
        await fetchUsers();
        Swal.fire("Éxito", "El estado del usuario se actualizó correctamente", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo actualizar el estado", "error");
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
      password: document.getElementById("password").value,
      user_type_id: parseInt(document.getElementById("user_type_id").value),
    };

    try {
      if (id) {
        await axios.patch(`${apiUrl}${id}`, userData);
        Swal.fire("Éxito", "Usuario actualizado correctamente", "success");
      } else {
        await axios.post(apiUrl, userData);
        Swal.fire("Éxito", "Usuario creado correctamente", "success");
      }
      userModal.hide();
      userForm.reset();
      fetchUsers();
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar el usuario", "error");
    }
  });

  // Filtros
  statusFilter.addEventListener("change", renderFilteredUsers);

  // Función para mostrar/ocultar contraseña
  window.togglePasswordVisibility = function () {
    const currentType = passwordField.type;
    passwordField.type = currentType === "password" ? "text" : "password";
    togglePasswordButton.textContent = passwordField.type === "password" ? "Mostrar" : "Ocultar";
  };

  // Carga inicial
  fetchUsers();
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  sidebar.classList.toggle("sidebar-hidden");
  mainContent.classList.toggle("main-collapsed");
}
