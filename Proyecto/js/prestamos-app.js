document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('formularioPrestamo');
  
  if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      guardarPrestamo();
    });
  }

  cargarPrestamos();
});

function guardarPrestamo() {
  const prestamo = {
    id: document.getElementById('idPrestamo').value,
    usuarioId: document.getElementById('idUsuario').value,
    libroId: document.getElementById('idLibro').value,
    fechaPrestamo: document.getElementById('fechaPrestamo').value,
    fechaDevolucion: document.getElementById('fechaDevolucion').value,
    estado: document.getElementById('estado').value,
    multa: document.getElementById('multa').value
  };

  fetch('http://localhost:3000/api/prestamo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prestamo)
  })
  .then(response => response.json())
  .then(data => {
    alert('Préstamo registrado correctamente');
    document.getElementById('formularioPrestamo').reset();
  })
  .catch(error => {
    alert('Error al registrar el préstamo: ' + error.message);
  });
}

function cargarPrestamos() {
  const tablaPrestamos = document.getElementById('tablaPrestamos');
  if (tablaPrestamos) {
    fetch('../data/listaprestamos.json')
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el archivo JSON de préstamos');
        return response.json();
      })
      .then(data => {
        const tbody = tablaPrestamos.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach(prestamo => {
          const fila = document.createElement('tr');
          let estado = '';
          if (prestamo.estado === 'Activo') {
            estado = '<span class="badge bg-warning">Activo</span>';
          } else if (prestamo.estado === 'Devuelto') {
            estado = '<span class="badge bg-success">Devuelto</span>';
          } else if (prestamo.estado === 'Atrasado') {
            estado = '<span class="badge bg-danger">Atrasado</span>';
          }
          fila.innerHTML = `
            <td class="id-cell">${prestamo.id || ''}</td>
            <td>${prestamo.usuario || ''}</td>
            <td>${prestamo.libro || ''}</td>
            <td>${prestamo.fechaPrestamo || ''}</td>
            <td>${prestamo.fechaDevolucion || ''}</td>
            <td>${estado}</td>
            <td>₡${prestamo.multa ?? '0'}</td>
          `;
          tbody.appendChild(fila);
        });
      })
      .catch(error => {
        const tbody = tablaPrestamos.querySelector('tbody');
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${error.message}</td></tr>`;
      });
  }
}
