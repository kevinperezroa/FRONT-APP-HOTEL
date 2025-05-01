function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}
    function loadDashboardData() {
      const month = document.getElementById('month').value;
      const year = document.getElementById('year').value;

      axios.get(`http://127.0.0.1:8000/api/dashboard?month=${month}&year=${year}`)
        .then(response => {
          const data = response.data;
          document.getElementById('total_recaudo').innerText = `$${data.total_recaudo.toFixed(2)}`;
          document.getElementById('porcentaje_ocupacion').innerText = `${data.porcentaje_ocupacion}%`;
          document.getElementById('promedio_dias').innerText = data.promedio_dias;
          document.getElementById('total_clientes').innerText = data.total_clientes;
        })
        .catch(error => {
          console.error("Error cargando datos del dashboard:", error);
        });
    }

    function downloadPDF() {
      const month = document.getElementById('month').value;
      const year = document.getElementById('year').value;
      window.open(`http://127.0.0.1:8000/api/dashboard/pdf?month=${month}&year=${year}`, '_blank');
    }

    window.onload = loadDashboardData;
