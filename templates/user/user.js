const apiUrl = "http://localhost:8000/api/user";

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  sidebar.classList.toggle("sidebar-hidden");
  mainContent.classList.toggle("main-collapsed");
}

document.addEventListener("DOMContentLoaded", fetchUsers);

function fetchUsers() {
  axios.get(apiUrl)
    .then(res => {
      const container = document.getElementById("userContainer");
      container.innerHTML = "";
      res.data.forEach(user => {
        let userType = user.user_type_id === 1 ? "Administrador" : "Usuario normal";
        container.innerHTML += `
          <div class="col-md-4 mb-4">
            <div class="card card-custom p-3">
              <div class="card-body">
                <h5 class="card-title">${user.username}</h5>
                <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                <p class="card-text"><strong>Tipo de Usuario:</strong> ${userType}</p>
                <div class="d-flex justify-content-between">
                  <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(() => alert("Error al obtener usuarios"));
}

function openUserModal() {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
  document.getElementById("passwordMessage").style.display = "block";
  new bootstrap.Modal(document.getElementById("userModal")).show();
}

function editUser(id) {
  axios.get(`${apiUrl}/${id}`).then(res => {
    const user = res.data;
    document.getElementById("userId").value = user.id;
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("user_type_id").value = user.user_type_id;
    document.getElementById("password").value = "";
    document.getElementById("passwordMessage").style.display = "block";
    new bootstrap.Modal(document.getElementById("userModal")).show();
  });
}

function deleteUser(id) {
  if (confirm("¿Seguro que deseas eliminar este usuario?")) {
    axios.delete(`${apiUrl}/${id}`).then(() => fetchUsers());
  }
}

document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const user = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    user_type_id: parseInt(document.getElementById("user_type_id").value),
    password: document.getElementById("password").value
  };

  if (id) {
    axios.patch(`${apiUrl}/${id}`, user).then(() => {
      bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
      fetchUsers();
    });
  } else {
    axios.post(apiUrl, user).then(() => {
      bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
      fetchUsers();
    });
  }
});

document.getElementById("password").addEventListener("input", function () {
  const password = this.value;
  const passwordMessage = document.getElementById("passwordMessage");
  passwordMessage.style.display = password.length >= 8 ? "none" : "block";
});
