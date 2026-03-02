// Mostrar libros en libros.html
document.addEventListener('DOMContentLoaded', function () {
	// Solo ejecuta si existe la tabla de libros
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
});
