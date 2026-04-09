/**
 * Aplicación de Gestión de Usuarios
 * Maneja la interacción entre el formulario y la tabla de usuarios
 */

let usuarios = [];

document.addEventListener('DOMContentLoaded', function () {
	cargarUsuarios();
	inicializarFormulario();
});

/**
 * Carga los usuarios desde el archivo JSON
 */
function cargarUsuarios() {
	fetch('../data/listausuarios.json')
		.then(response => {
			if (!response.ok) {
				if (response.status === 404) {
					// Si no existe el archivo, inicializar con array vacío
					console.log('Archivo de usuarios no existe aún');
					usuarios = [];
					mostrarTablaUsuarios();
					actualizarResumen();
					return;
				}
				throw new Error('No se pudo cargar el archivo JSON de usuarios');
			}
			return response.json();
		})
		.then(data => {
			if (data && Array.isArray(data) && data.length > 0) {
				usuarios = data.map(item => Usuario.fromJSON(item));
				mostrarTablaUsuarios();
				actualizarResumen();
			} else {
				usuarios = [];
				mostrarTablaUsuarios();
				actualizarResumen();
			}
		})
		.catch(error => {
			console.error('Error cargando usuarios:', error.message);
			usuarios = [];
			mostrarTablaUsuarios();
			actualizarResumen();
		});
}

/**
 * Inicializa los eventos del formulario
 */
function inicializarFormulario() {
	const formulario = document.getElementById('formularioUsuario');
	const btnGuardar = document.getElementById('btnGuardar');
	const btnLimpiar = document.getElementById('btnLimpiar');

	formulario.addEventListener('submit', function (e) {
		e.preventDefault();
		guardarUsuario();
	});

	btnLimpiar.addEventListener('click', function () {
		formulario.reset();
		btnGuardar.textContent = 'Guardar';
		document.getElementById('usuarioId').disabled = false;
	});
}

/**
 * Guarda o actualiza un usuario des del formulario
 */
function guardarUsuario() {
	const id = document.getElementById('usuarioId').value.trim();
	const nombre = document.getElementById('usuarioNombre').value.trim();
	const apellido = document.getElementById('usuarioApellido').value.trim();
	const email = document.getElementById('usuarioEmail').value.trim();
	const telefono = document.getElementById('usuarioTelefono').value.trim();
	const tipo = document.getElementById('usuarioTipo').value;
	const estado = document.getElementById('usuarioEstado').value;

	// Crear nuevo usuario
	const nuevoUsuario = new Usuario(id, nombre, apellido, email, telefono, tipo, estado);

	// Validar usuario
	const validacion = nuevoUsuario.validar();
	if (!validacion.valido) {
		mostrarAlerta('Error en la validación', validacion.errores.join('<br>'), 'danger');
		return;
	}

	// Buscar si el usuario ya existe
	const usuarioExistente = usuarios.findIndex(u => u.id === id);

	if (usuarioExistente !== -1) {
		// Actualizar usuario existente
		usuarios[usuarioExistente].actualizar({
			nombre: nombre,
			apellido: apellido,
			email: email,
			telefono: telefono,
			tipo: tipo,
			estado: estado
		});
		mostrarAlerta('Éxito', `Usuario "${nuevoUsuario.getNombreCompleto()}" actualizado correctamente.`, 'success');
	} else {
		// Agregar nuevo usuario
		usuarios.push(nuevoUsuario);
		mostrarAlerta('Éxito', `Usuario "${nuevoUsuario.getNombreCompleto()}" registrado correctamente.`, 'success');
	}

	// Actualizar tabla y limpiar formulario
	mostrarTablaUsuarios();
	actualizarResumen();
	document.getElementById('formularioUsuario').reset();
	document.getElementById('btnGuardar').textContent = 'Guardar';
	document.getElementById('usuarioId').disabled = false;
}

/**
 * Muestra la tabla de usuarios
 */
function mostrarTablaUsuarios() {
	const tablaUsuarios = document.getElementById('tablaUsuarios');
	if (!tablaUsuarios) return;

	const tbody = tablaUsuarios.querySelector('tbody');
	tbody.innerHTML = '';

	if (usuarios.length === 0) {
		tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay usuarios registrados</td></tr>';
		return;
	}

	usuarios.forEach((usuario, idx) => {
		const fila = document.createElement('tr');
		fila.innerHTML = `
			<td class="id-cell">${usuario.id}</td>
			<td>${usuario.nombre}</td>
			<td>${usuario.apellido}</td>
			<td>${usuario.email}</td>
			<td>${usuario.telefono || '-'}</td>
			<td>${usuario.tipo}</td>
			<td>${usuario.getEstadoBadge()}</td>
			<td>
				<button class="btn btn-sm btn-primary btn-editar" data-id="${usuario.id}" title="Editar">
					<i class="fa-solid fa-edit"></i>
				</button>
				<button class="btn btn-sm btn-danger btn-eliminar" data-id="${usuario.id}" title="Eliminar">
					<i class="fa-solid fa-trash"></i>
				</button>
			</td>
		`;
		tbody.appendChild(fila);
	});

	// Agregar eventos a los botones
	agregarEventosBotones();
}

/**
 * Agrega eventos a los botones de editar y eliminar
 */
function agregarEventosBotones() {
	// Botones de editar
	document.querySelectorAll('.btn-editar').forEach(btn => {
		btn.addEventListener('click', function () {
			const id = this.getAttribute('data-id');
			editarUsuario(id);
		});
	});

	// Botones de eliminar
	document.querySelectorAll('.btn-eliminar').forEach(btn => {
		btn.addEventListener('click', function () {
			const id = this.getAttribute('data-id');
			eliminarUsuario(id);
		});
	});
}

/**
 * Carga un usuario en el formulario para editarlo
 * @param {string} id - ID del usuario a editar
 */
function editarUsuario(id) {
	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		mostrarAlerta('Error', 'Usuario no encontrado', 'danger');
		return;
	}

	// Cargar datos en el formulario
	document.getElementById('usuarioId').value = usuario.id;
	document.getElementById('usuarioNombre').value = usuario.nombre;
	document.getElementById('usuarioApellido').value = usuario.apellido;
	document.getElementById('usuarioEmail').value = usuario.email;
	document.getElementById('usuarioTelefono').value = usuario.telefono;
	document.getElementById('usuarioTipo').value = usuario.tipo;
	document.getElementById('usuarioEstado').value = usuario.estado;

	// Cambiar botón de guardar a actualizar
	const btnGuardar = document.getElementById('btnGuardar');
	btnGuardar.textContent = 'Actualizar';

	// Desabilitar el campo ID (no se puede cambiar)
	document.getElementById('usuarioId').disabled = true;

	// Scroll al formulario
	document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Elimina un usuario
 * @param {string} id - ID del usuario a eliminar
 */
function eliminarUsuario(id) {
	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		mostrarAlerta('Error', 'Usuario no encontrado', 'danger');
		return;
	}

	// Confirmar eliminación
	if (confirm(`¿Está seguro de que desea eliminar a ${usuario.getNombreCompleto()}?`)) {
		usuarios = usuarios.filter(u => u.id !== id);
		mostrarTablaUsuarios();
		actualizarResumen();
		mostrarAlerta('Éxito', `Usuario "${usuario.getNombreCompleto()}" eliminado correctamente.`, 'success');
	}
}

/**
 * Actualiza el resumen de usuarios
 */
function actualizarResumen() {
	const resumenDiv = document.getElementById('resumenUsuarios');

	if (!resumenDiv) return;

	const totalUsuarios = usuarios.length;
	const usuariosActivos = usuarios.filter(u => u.estado === 'Activo').length;
	const usuariosInactivos = usuarios.filter(u => u.estado === 'Inactivo').length;

	const tiposUsuarios = {};
	usuarios.forEach(u => {
		tiposUsuarios[u.tipo] = (tiposUsuarios[u.tipo] || 0) + 1;
	});

	// Mapeo de plurales
	const plurales = {
		'Estudiante': 'Estudiantes',
		'Profesor': 'Profesores',
		'Personal': 'Personales'
	};

	let html = `
		<div class="row text-center">
			<div class="col-md-4">
				<h3 class="numero-total">${totalUsuarios}</h3>
				<p class="texto-tipo">Total de Usuarios</p>
			</div>
			<div class="col-md-4">
				<h3 class="numero-activos">${usuariosActivos}</h3>
				<p class="texto-tipo">Usuarios Activos</p>
			</div>
			<div class="col-md-4">
				<h3 class="numero-inactivos">${usuariosInactivos}</h3>
				<p class="texto-tipo">Usuarios Inactivos</p>
			</div>
		</div>
		<hr>
		<div class="mt-3">
			<h6 class="titulo-distribucion fw-bold mb-3">Distribución por Tipo</h6>
			<div class="row">
				${Object.entries(tiposUsuarios).map(([tipo, cantidad]) => {
					let claseNumero = '';
					if (tipo === 'Estudiante') claseNumero = 'numero';
					else if (tipo === 'Profesor') claseNumero = 'numero';
					else if (tipo === 'Personal') claseNumero = 'numero';
					return `
					<div class="col-md-4 text-center">
						<h5 class="${claseNumero}">${cantidad}</h5>
						<small class="texto-tipo">${plurales[tipo] || tipo}</small>
					</div>
				`;
				}).join('')}
			</div>
		</div>
	`;

	resumenDiv.innerHTML = html;
}

/**
 * Muestra una alerta en la pantalla
 * @param {string} titulo - Título de la alerta
 * @param {string} mensaje - Mensaje de la alerta
 * @param {string} tipo - Tipo de alerta (success, danger, warning, info)
 */
function mostrarAlerta(titulo, mensaje, tipo) {
	const alertDiv = document.createElement('div');
	alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
	alertDiv.role = 'alert';
	alertDiv.innerHTML = `
		<strong>${titulo}:</strong> ${mensaje}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
	`;

	// Insertar alerta al inicio del main
	const mainElement = document.querySelector('main');
	mainElement.insertBefore(alertDiv, mainElement.firstChild);

	// Auto-cerrar después de 5 segundos
	setTimeout(() => {
		alertDiv.remove();
	}, 5000);
}

/**
 * Exporta los usuarios a JSON (para descargar)
 */
function exportarUsuariosJSON() {
	const usuariosJSON = JSON.stringify(usuarios.map(u => JSON.parse(u.toJSON())), null, 2);
	const blob = new Blob([usuariosJSON], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `usuarios-${new Date().toISOString().split('T')[0]}.json`;
	link.click();
	URL.revokeObjectURL(url);
}
