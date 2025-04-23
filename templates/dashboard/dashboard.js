function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("main-collapsed");
}

function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Estadísticas del Hotel Hidden", 20, 20);
    doc.text("Total Recaudado este Mes: $0.00", 20, 30);
    doc.text("Total de Clientes este Mes: 0", 20, 40);
    doc.text("Porcentaje de Habitaciones Reservadas: 0%", 20, 50);
    doc.text("Promedio de Días Reservados: 0 días", 20, 60);
    doc.text("Promedio de Noches Reservadas: 0 noches", 20, 70);

    doc.save("estadisticas_hotel.pdf");
}