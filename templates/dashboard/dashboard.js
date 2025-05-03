const apiUrl = "http://127.0.0.1:8000/api/dashboard";
const monthlyPdfUrl = "http://127.0.0.1:8000/api/dashboard/pdf";


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

function loadDashboardData() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    const params = { year: year };

    if (month !== "") {
        params.month = month;
    }

    if (year === "") {
        console.warn("Please select a year to load data.");
        document.getElementById('total_recaudo_monthly').innerText = '$0.00';
        document.getElementById('porcentaje_ocupacion_monthly').innerText = '0%';
        document.getElementById('promedio_dias_monthly').innerText = '0';
        document.getElementById('total_clientes_monthly').innerText = '0';
        return;
    }

    axios.get(apiUrl, { params: params })
        .then(response => {
            const data = response.data;
            document.getElementById('total_recaudo_monthly').innerText = `$${data.total_recaudo.toFixed(2)}`;
            document.getElementById('porcentaje_ocupacion_monthly').innerText = `${data.porcentaje_ocupacion}%`;
            document.getElementById('promedio_dias_monthly').innerText = data.promedio_dias;
            document.getElementById('total_clientes_monthly').innerText = data.total_clientes;
        })
        .catch(error => {
            console.error("Error cargando datos del dashboard:", error);
            if (typeof Swal !== 'undefined') {
                 Swal.fire("Error", "No se pudieron cargar los datos del dashboard.", "error");
            } else {
                alert("Error: No se pudieron cargar los datos del dashboard.");
            }
        });
}

function downloadPDF() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    if (year === "") {
        console.warn("Please select a year to download PDF.");
         if (typeof Swal !== 'undefined') {
                 Swal.fire("Advertencia", "Por favor, selecciona un año para descargar el PDF.", "warning");
            } else {
                alert("Advertencia: Por favor, selecciona un año para descargar el PDF.");
            }
        return;
    }

    if (month === "") {
         console.warn("Please select a month to download monthly PDF.");
         if (typeof Swal !== 'undefined') {
                 Swal.fire("Advertencia", "Por favor, selecciona un mes para descargar el PDF mensual.", "warning");
            } else {
                alert("Advertencia: Por favor, selecciona un mes para descargar el PDF mensual.");
            }
        return;
    }

    window.open(`${monthlyPdfUrl}?month=${month}&year=${year}`, '_blank');
}

function setDefaultFilters() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');

    for (let i = 0; i < monthSelect.options.length; i++) {
        if (parseInt(monthSelect.options[i].value) === currentMonth) {
            monthSelect.selectedIndex = i;
            break;
        }
    }

    for (let i = 0; i < yearSelect.options.length; i++) {
        if (parseInt(yearSelect.options[i].value) === currentYear) {
            yearSelect.selectedIndex = i;
            break;
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    setDefaultFilters();
    loadDashboardData();

    const sidebarToggler = document.getElementById('sidebarToggle');
     if (sidebarToggler) {
       sidebarToggler.addEventListener('click', toggleSidebar);
     }
});
