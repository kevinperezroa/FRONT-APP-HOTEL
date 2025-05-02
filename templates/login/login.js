document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        username,
        password
      });

      document.getElementById("message").innerHTML = `
        <div class="alert alert-success">
          ${response.data.message}
        </div>
      `;

      // vista a la que se dirige una vez inicia sesion
      window.location.href = "/templates/dashboard/dashboard.html";

    } catch (error) {
      const errMsg = error.response?.data?.detail || "Error desconocido";
      document.getElementById("message").innerHTML = `
        <div class="alert alert-danger">
          ${errMsg}
        </div>
      `;
    }
  });
