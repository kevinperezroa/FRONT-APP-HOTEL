let rooms = [];
    let clients = [];
    let reservationStatuses = [];
    let reservations = [];
    let users = [];

    async function fetchData() {
      try {

        const usersResponse = await axios.get('http://127.0.0.1:8000/api/user');
        users = usersResponse.data;

        const clientsResponse = await axios.get('http://127.0.0.1:8000/api/client');
        clients = clientsResponse.data;

        const roomsResponse = await axios.get('http://127.0.0.1:8000/api/room');
        rooms = roomsResponse.data;

        const statusResponse = await axios.get('http://127.0.0.1:8000/api/reservationstatus');
        reservationStatuses = statusResponse.data;

        const reservationsResponse = await axios.get('http://127.0.0.1:8000/api/reservations');
        reservations = reservationsResponse.data;

        populateTables();
        populateSelects();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    function populateSelects() {
      const userSelect = document.getElementById('user_id');
      const clientSelect = document.getElementById('client_id');
      const roomSelect = document.getElementById('room_id');
      const statusSelect = document.getElementById('reservation_status_id');


      userSelect.innerHTML = '<option value="">Seleccionar...</option>';
      users.forEach(user => {
        const option = document.createElement('option');  // Correct element type
        option.value = user.id;
        option.textContent = user.username;
        userSelect.appendChild(option);  // Append to userSelect, not user
      });


      clientSelect.innerHTML = '<option value="">Seleccionar...</option>';
      clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.first_name} ${client.last_name}`;
        clientSelect.appendChild(option);
      });

      roomSelect.innerHTML = '<option value="">Seleccionar...</option>';
      rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `Habitación ${room.room_number}`;
        roomSelect.appendChild(option);
      });

      statusSelect.innerHTML = '<option value="">Seleccionar...</option>';
      reservationStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.name;
        statusSelect.appendChild(option);
      });
    }

    function populateTables() {
      const reservationTableBody = document.getElementById('reservationTableBody');
      reservationTableBody.innerHTML = '';
      reservations.forEach(reservation => {
        const user = users.find(u => u.id === reservation.user_id);
        const client = clients.find(c => c.id === reservation.client_id);
        const room = rooms.find(r => r.id === reservation.room_id);
        const status = reservationStatuses.find(s => s.id === reservation.reservation_status_id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reservation.id}</td>
          <td>${client ? client.first_name + " " + client.last_name : 'Desconocido'}</td>
          <td>${room ? room.room_number : 'Desconocido'}</td>
          <td>${reservation.check_in_date}</td>
          <td>${reservation.check_out_date}</td>
          <td>${reservation.total}</td>
          <td>${status ? status.name : 'Desconocido'}</td>
          <td>${user ? user.username : 'Desconocido'}</td>
          <td>
            <button class="btn btn-warning" onclick="editReservation(${reservation.id})">Editar</button>
            <button class="btn btn-danger" onclick="deleteReservation(${reservation.id})">Eliminar</button>
          </td>
        `;
        reservationTableBody.appendChild(tr);
      });
    }

    function openReservationModal() {
      document.getElementById('reservationId').value = '';
      document.getElementById('client_id').value = '';
      document.getElementById('room_id').value = '';
      document.getElementById('user_id').value = '';
      document.getElementById('reservation_status_id').value = '';
      document.getElementById('check_in_date').value = '';
      document.getElementById('check_out_date').value = '';
      document.getElementById('note').value = '';

      const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
      modal.show();
    }

    function editReservation(id) {
      const reservation = reservations.find(r => r.id === id);
      if (reservation) {
        document.getElementById('reservationId').value = reservation.id;
        document.getElementById('client_id').value = reservation.client_id;
        document.getElementById('room_id').value = reservation.room_id;
        document.getElementById('user_id').value = reservation.user_id;
        document.getElementById('reservation_status_id').value = reservation.reservation_status_id;
        document.getElementById('check_in_date').value = reservation.check_in_date;
        document.getElementById('check_out_date').value = reservation.check_out_date;
        document.getElementById('note').value = reservation.note;

        const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
        modal.show();
      }
    }

    function deleteReservation(id) {
      if (confirm("¿Estás seguro de que deseas eliminar esta reserva?")) {
        axios.delete(`http://127.0.0.1:8000/api/reservations/${id}`)
          .then(response => {
            reservations = reservations.filter(r => r.id !== id);
            populateTables();
          })
          .catch(error => console.error("Error eliminando reserva:", error));
      }
    }

    function searchReservations() {
      const searchQuery = document.getElementById('searchClient').value.toLowerCase();
      const filteredReservations = reservations.filter(reservation => {
        const client = clients.find(c => c.id === reservation.client_id);
        return client && (client.first_name.toLowerCase().includes(searchQuery) || client.last_name.toLowerCase().includes(searchQuery));
      });
      reservations = filteredReservations;
      populateTables();
    }

    document.getElementById('reservationForm').addEventListener('submit', function (event) {
      event.preventDefault();  // Previene que el formulario se envíe y recargue la página.

      const reservationId = document.getElementById('reservationId').value;
      const clientId = document.getElementById('client_id').value;
      const roomId = document.getElementById('room_id').value;
      const userId = document.getElementById('user_id').value;
      const reservationStatusId = document.getElementById('reservation_status_id').value;
      const checkInDate = document.getElementById('check_in_date').value;
      const checkOutDate = document.getElementById('check_out_date').value;
      const note = document.getElementById('note').value;

      const reservationData = {
        client_id: clientId,
        room_id: roomId,
        reservation_status_id: reservationStatusId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        note: note,
        user_id: userId,
      };

      if (reservationId) {
        // Si hay ID, es una edición
        axios.patch(`http://127.0.0.1:8000/api/reservations/${reservationId}`, reservationData)
          .then(response => {
            // Actualiza la reserva en la tabla sin recargar
            const updatedReservation = response.data;
            const index = reservations.findIndex(r => r.id === updatedReservation.id);
            reservations[index] = updatedReservation;
            populateTables();  // Recarga las reservas en la tabla
            document.getElementById('reservationModal').querySelector('.btn-close').click(); // Cierra el modal
          })
          .catch(error => {
            console.error('Error editando reserva:', error);
            alert('Error al editar la reserva');
          });
      } else {
        // Si no hay ID, es una creación
        axios.post('http://127.0.0.1:8000/api/reservations/', reservationData)
          .then(response => {
            reservations.push(response.data);  // Agrega la nueva reserva
            populateTables();  // Recarga las reservas en la tabla
            document.getElementById('reservationModal').querySelector('.btn-close').click(); // Cierra el modal
          })
          .catch(error => {
            console.error('Error creando reserva:', error);
            alert('Error al crear la reserva');
          });
      }
    });

    fetchData(); // Llama a la función de i// Llama a la función de i

    function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const mainContent = document.getElementById("main-content");
        sidebar.classList.toggle("sidebar-hidden");
        mainContent.classList.toggle("main-collapsed");
    }
