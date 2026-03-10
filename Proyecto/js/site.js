document.addEventListener('DOMContentLoaded', function () {

	const tablaLibros = document.getElementById('tablaLibros');
	if (tablaLibros) {
		fetch('../data/listalibros.json')
			.then(response => {
				if (!response.ok) throw new Error('No se pudo cargar el archivo JSON de libros');
				return response.json();
			})
			.then(data => {
				const tbody = tablaLibros.querySelector('tbody');
				tbody.innerHTML = '';
				data.forEach((libro, idx) => {
					const fila = document.createElement('tr');
					let disponible = '';
					if (libro.disponible === true || libro.disponible === 'Sí' || libro.disponible === 'si') {
						disponible = '<span class="badge-disponible">Sí</span>';
					} else {
						disponible = '<span class="badge-detenido">No</span>';
					}
					fila.innerHTML = `
						<td class="id-cell">${idx + 1}</td>
						<td>${libro.titulo || ''}</td>
						<td>${libro.autor || ''}</td>
						<td>${libro.editorial || ''}</td>
						<td>${libro.anio || libro.año || ''}</td>
						<td>${libro.categoria || ''}</td>
						<td>${disponible}</td>
						<td>${libro.copias ?? ''}</td>
					`;
					tbody.appendChild(fila);
				});
			})
			.catch(error => {
				const tbody = tablaLibros.querySelector('tbody');
				tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${error.message}</td></tr>`;
			});
	}

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

					let estadoBadge = '';
					if (prestamo.estado) {
					  let clase = 'badge-estado';
					  if (prestamo.estado === 'Devuelto') clase += ' badge-estado-devuelto';
					  else if (prestamo.estado === 'Pendiente') clase += ' badge-estado-pendiente';
					  else if (prestamo.estado === 'Atrasado') clase += ' badge-estado-atrasado';
					  else if (prestamo.estado === 'Disponible') clase += ' badge-estado-disponible';
					  estadoBadge = `<span class="${clase}">${prestamo.estado}</span>`;
					}
					fila.innerHTML = `
						<td class="id-cell">${prestamo.idPrestamo || ''}</td>
						<td>${prestamo.usuario || ''}</td>
						<td>${prestamo.libro || ''}</td>
						<td>${prestamo.fechaPrestamo || ''}</td>
						<td>${prestamo.fechaDevolucion || ''}</td>
						<td>${estadoBadge}</td>
						<td>${prestamo.multa ? `₡${prestamo.multa}` : '₡0'}</td>
					`;
					tbody.appendChild(fila);
				});
			})
			.catch(error => {
				const tbody = tablaPrestamos.querySelector('tbody');
				tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${error.message}</td></tr>`;
			});
	}
});
