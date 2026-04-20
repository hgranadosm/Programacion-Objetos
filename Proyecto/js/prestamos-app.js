const API_URL = 'http://localhost:3000/api';
let _modoEdicionId = null;

document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('formularioPrestamo');
  const btnLimpiar = document.getElementById('btnLimpiarPrestamo');

  if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      guardarPrestamo(API_URL);
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
      cancelarEdicion();
    });
  }

  cargarPrestamos(API_URL);
});

function limpiarMensajesValidacion() {
  const campos = ['idUsuario', 'idLibro', 'fechaPrestamo', 'fechaDevolucion', 'estado', 'multa'];
  const mensajeGeneral = document.getElementById('mensajeValidacionPrestamo');

  campos.forEach(campoId => {
    const input = document.getElementById(campoId);
    const mensaje = document.getElementById(`error-${campoId}`);

    if (input) {
      input.classList.remove('is-invalid');
    }

    if (mensaje) {
      mensaje.textContent = '';
    }
  });

  if (mensajeGeneral) {
    mensajeGeneral.textContent = '';
  }
}

function mostrarErroresValidacion(errores) {
  const mensajeGeneral = document.getElementById('mensajeValidacionPrestamo');

  Object.entries(errores).forEach(([campoId, mensaje]) => {
    const input = document.getElementById(campoId);
    const contenedorError = document.getElementById(`error-${campoId}`);

    if (input) {
      input.classList.add('is-invalid');
    }

    if (contenedorError) {
      contenedorError.textContent = mensaje;
    }
  });

  if (mensajeGeneral && Object.keys(errores).length > 0) {
    mensajeGeneral.textContent = 'Revisa los campos marcados para continuar.';
  }
}

function validarPrestamo(prestamo) {
  const errores = {};
  const estadosPermitidos = ['Activo', 'Devuelto', 'Atrasado', 'Pendiente'];

  if (!prestamo.usuarioId) errores.idUsuario = 'El usuario es obligatorio.';
  if (!prestamo.libroId) errores.idLibro = 'El libro es obligatorio.';
  if (!prestamo.fechaPrestamo) errores.fechaPrestamo = 'La fecha de prestamo es obligatoria.';
  if (!prestamo.fechaDevolucion) errores.fechaDevolucion = 'La fecha de devolucion es obligatoria.';

  if (prestamo.fechaPrestamo && prestamo.fechaDevolucion && prestamo.fechaDevolucion < prestamo.fechaPrestamo) {
    errores.fechaDevolucion = 'La fecha de devolucion no puede ser anterior a la fecha de prestamo.';
  }

  if (!estadosPermitidos.includes(prestamo.estado)) {
    errores.estado = 'Selecciona un estado valido.';
  }

  if (!Number.isFinite(prestamo.multa) || prestamo.multa < 0) {
    errores.multa = 'La multa debe ser un numero mayor o igual a 0.';
  }

  return errores;
}

function guardarPrestamo(apiUrl) {
  const prestamo = {
    usuarioId: document.getElementById('idUsuario').value.trim(),
    libroId: document.getElementById('idLibro').value.trim(),
    usuario: document.getElementById('idUsuario').value.trim(),
    libro: document.getElementById('idLibro').value.trim(),
    fechaPrestamo: document.getElementById('fechaPrestamo').value,
    fechaDevolucion: document.getElementById('fechaDevolucion').value,
    estado: document.getElementById('estado').value,
    multa: Number(document.getElementById('multa').value || 0)
  };

  limpiarMensajesValidacion();
  const errores = validarPrestamo(prestamo);
  if (Object.keys(errores).length > 0) {
    mostrarErroresValidacion(errores);
    return;
  }

  const esEdicion = _modoEdicionId !== null;
  const url = esEdicion ? `${apiUrl}/prestamo/${_modoEdicionId}` : `${apiUrl}/prestamo`;
  const method = esEdicion ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prestamo)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.mensaje || 'No se pudo guardar el prestamo');
        });
      }
      return response.json();
    })
    .then(data => {
      alert(data.mensaje || 'Prestamo guardado correctamente');
      cancelarEdicion();
      cargarPrestamos(apiUrl);
    })
    .catch(error => {
      alert('Error: ' + error.message);
    });
}

function cancelarEdicion() {
  _modoEdicionId = null;
  document.getElementById('formularioPrestamo').reset();
  document.getElementById('multa').value = '0';
  limpiarMensajesValidacion();

  const btnRegistrar = document.getElementById('btnRegistrarPrestamo');
  const btnLimpiar = document.getElementById('btnLimpiarPrestamo');

  if (btnRegistrar) btnRegistrar.textContent = 'Registrar Préstamo';
  if (btnLimpiar) btnLimpiar.style.display = 'none';
}

function cargarPrestamos(apiUrl) {
  const tablaPrestamos = document.getElementById('tablaPrestamos');
  if (tablaPrestamos) {
    fetch(`${apiUrl}/prestamos`)
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el JSON de prestamos del servidor');
        return response.json();
      })
      .then(data => {
        const tbody = tablaPrestamos.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach(prestamo => {
          const fila = document.createElement('tr');
          let estadoBadge = '';
          if (prestamo.estado === 'Activo') {
            estadoBadge = '<span class="badge bg-warning">Activo</span>';
          } else if (prestamo.estado === 'Devuelto') {
            estadoBadge = '<span class="badge bg-success">Devuelto</span>';
          } else if (prestamo.estado === 'Atrasado') {
            estadoBadge = '<span class="badge bg-danger">Atrasado</span>';
          } else if (prestamo.estado === 'Pendiente') {
            estadoBadge = '<span class="badge bg-secondary">Pendiente</span>';
          }
          fila.innerHTML = `
            <td class="id-cell">${prestamo.id || ''}</td>
            <td>${prestamo.usuario || prestamo.usuarioId || ''}</td>
            <td>${prestamo.libro || prestamo.libroId || ''}</td>
            <td>${prestamo.fechaPrestamo || ''}</td>
            <td>${prestamo.fechaDevolucion || ''}</td>
            <td>${estadoBadge}</td>
            <td>₡${prestamo.multa ?? '0'}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-editar-prestamo" data-id="${prestamo.id}" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger btn-eliminar-prestamo" data-id="${prestamo.id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `;
          tbody.appendChild(fila);
        });
        agregarEventosBotonesPrestamos(data, apiUrl);
      })
      .catch(error => {
        const tbody = tablaPrestamos.querySelector('tbody');
        tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${error.message}</td></tr>`;
      });
  }
}

function agregarEventosBotonesPrestamos(data, apiUrl) {
  document.querySelectorAll('.btn-editar-prestamo').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const prestamo = data.find(p => String(p.id) === String(id));
      if (prestamo) editarPrestamo(prestamo);
    });
  });

  document.querySelectorAll('.btn-eliminar-prestamo').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      eliminarPrestamo(id, apiUrl);
    });
  });
}

function editarPrestamo(prestamo) {
  _modoEdicionId = prestamo.id;

  document.getElementById('idUsuario').value = prestamo.usuario || prestamo.usuarioId || '';
  document.getElementById('idLibro').value = prestamo.libro || prestamo.libroId || '';
  document.getElementById('fechaPrestamo').value = prestamo.fechaPrestamo || '';
  document.getElementById('fechaDevolucion').value = prestamo.fechaDevolucion || '';
  document.getElementById('estado').value = prestamo.estado || 'Activo';
  document.getElementById('multa').value = prestamo.multa ?? 0;

  const btnRegistrar = document.getElementById('btnRegistrarPrestamo');
  const btnLimpiar = document.getElementById('btnLimpiarPrestamo');
  if (btnRegistrar) btnRegistrar.textContent = 'Actualizar Préstamo';
  if (btnLimpiar) btnLimpiar.style.display = 'inline-block';

  limpiarMensajesValidacion();
  document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eliminarPrestamo(id, apiUrl) {
  if (!confirm(`¿Está seguro de que desea eliminar el préstamo con ID ${id}?`)) return;

  fetch(`${apiUrl}/prestamo/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.mensaje || 'No se pudo eliminar el prestamo');
        });
      }
      return response.json();
    })
    .then(data => {
      alert(data.mensaje || 'Prestamo eliminado correctamente');
      cargarPrestamos(apiUrl);
    })
    .catch(error => {
      alert('Error: ' + error.message);
    });
}
