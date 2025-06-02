const apiUrl = "http://127.0.0.1:8000/api/dashboard";
const monthlyPdfUrl = "http://127.0.0.1:8000/api/dashboard/pdf";

// Función para obtener el token del localStorage
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }
    return {}; // Retorna un objeto vacío si no hay token
}

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

        // Mostrar advertencia si no hay año seleccionado
        if (typeof Swal !== 'undefined') {
            Swal.fire("Advertencia", "Por favor, selecciona un año para cargar los datos.", "warning");
        } else {
            alert("Advertencia: Por favor, selecciona un año para cargar los datos.");
        }
        return;
    }

    // Añade las cabeceras de autorización aquí
    axios.get(apiUrl, { params: params, ...getAuthHeaders() })
        .then(response => {
            const data = response.data;
            document.getElementById('total_recaudo_monthly').innerText = `$${data.total_recaudo.toFixed(2)}`;
            document.getElementById('porcentaje_ocupacion_monthly').innerText = `${data.porcentaje_ocupacion}%`;
            document.getElementById('promedio_dias_monthly').innerText = data.promedio_dias;
            document.getElementById('total_clientes_monthly').innerText = data.total_clientes;
        })
        .catch(error => {
            console.error("Error cargando datos del dashboard:", error);
            // Manejo de error de autenticación/autorización
            if (error.response && error.response.status === 401) {
                // Si el token es inválido o ha expirado
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: "Sesión expirada",
                        text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
                        icon: "warning",
                        confirmButtonText: "Ir a Iniciar Sesión"
                    }).then(() => {
                        localStorage.removeItem("token"); // Limpiar el token inválido
                        window.location.href = "/index.html"; // Redirigir a la página de login
                    });
                } else {
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    localStorage.removeItem("token");
                    window.location.href = "/index.html";
                }
            } else {
                // Otros errores
                if (typeof Swal !== 'undefined') {
                    Swal.fire("Error", "No se pudieron cargar los datos del dashboard.", "error");
                } else {
                    alert("Error: No se pudieron cargar los datos del dashboard.");
                }
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


    // Ejemplo de descarga con Axios si la API requiere headers y devuelve un blob:
    axios.get(`${monthlyPdfUrl}?month=${month}&year=${year}`, {
        responseType: 'blob', // Importante para descargar archivos
        ...getAuthHeaders() // Envía el token
    })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_dashboard_${year}${month}.pdf`); // Nombre del archivo
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Limpiar URL del objeto
        })
        .catch(error => {
            console.error("Error descargando PDF:", error);
            if (error.response && error.response.status === 401) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: "Sesión expirada",
                        text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo para descargar el PDF.",
                        icon: "warning",
                        confirmButtonText: "Ir a Iniciar Sesión"
                    }).then(() => {
                        localStorage.removeItem("token");
                        window.location.href = "/index.html";
                    });
                } else {
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    localStorage.removeItem("token");
                    window.location.href = "/index.html";
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire("Error", "No se pudo descargar el PDF.", "error");
                } else {
                    alert("Error: No se pudo descargar el PDF.");
                }
            }
        });


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
    // Validar token al cargar la página
    const token = localStorage.getItem("token");
    if (!token) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: "Acceso denegado",
                text: "Debes iniciar sesión para ver el dashboard.",
                icon: "error",
                confirmButtonText: "Ir a Iniciar Sesión"
            }).then(() => {
                window.location.href = "/index.html"; // Redirigir a la página de login
            });
        } else {
            alert("Acceso denegado. Debes iniciar sesión.");
            window.location.href = "/index.html"; // Redirigir a la página de login
        }
        return; // Detener la ejecución si no hay token
    }
    // Cerrar sesión
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "Tu sesión actual se cerrará.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token"); // Elimina el token
                Swal.fire({
                    title: "Sesión cerrada",
                    text: "Has cerrado sesión correctamente.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/index.html"; // Redirige al login
                });
            }
        });
    });


    setDefaultFilters();
    loadDashboardData();

    const sidebarToggler = document.getElementById('sidebarToggle');
    if (sidebarToggler) {
        sidebarToggler.addEventListener('click', toggleSidebar);
    }
});

