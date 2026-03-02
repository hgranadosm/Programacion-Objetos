// Mostrar libros en libros.html
document.addEventListener('DOMContentLoaded', function () {
	// Mostrar libros
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
				data.forEach(libro => {
					const fila = document.createElement('tr');
					fila.innerHTML = `
						<td>${libro.titulo || ''}</td>
						<td>${libro.autor || ''}</td>
						<td>${libro.editorial || ''}</td>
						<td>${libro.anio || libro.año || ''}</td>
						<td>${libro.categoria || ''}</td>
						<td>${libro.disponible ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>'}</td>
						<td>${libro.copias || ''}</td>
					`;
					tbody.appendChild(fila);
				});
			})
			.catch(error => {
				const tbody = tablaLibros.querySelector('tbody');
				tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${error.message}</td></tr>`;
			});
	}

	// Mostrar préstamos
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
					fila.innerHTML = `
						<td>${prestamo.idPrestamo || ''}</td>
						<td>${prestamo.usuario || ''}</td>
						<td>${prestamo.libro || ''}</td>
						<td>${prestamo.fechaPrestamo || ''}</td>
						<td>${prestamo.fechaDevolucion || ''}</td>
						<td>${prestamo.estado ? `<span class="badge ${prestamo.estado === 'Devuelto' ? 'bg-success' : prestamo.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-danger'}">${prestamo.estado}</span>` : ''}</td>
						<td>${prestamo.multa ? `<span class="text-danger">₡${prestamo.multa}</span>` : '₡0'}</td>
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
