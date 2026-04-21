let usuarios = [];
let _idEdicionUsuario = null;

function generarIdUsuario() {
	const maxId = usuarios.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
	return String(maxId + 1);
}

document.addEventListener('DOMContentLoaded', function () {
	cargarUsuarios();
	inicializarFormulario();
});

function cargarUsuarios() {
	fetch('../data/listausuarios.json')
		.then(response => {
			if (!response.ok) {
				if (response.status === 404) {
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
		_idEdicionUsuario = null;
	});
}

function guardarUsuario() {
	const nombre = document.getElementById('usuarioNombre').value.trim();
	const apellido = document.getElementById('usuarioApellido').value.trim();
	const email = document.getElementById('usuarioEmail').value.trim();
	const telefono = document.getElementById('usuarioTelefono').value.trim();
	const tipo = document.getElementById('usuarioTipo').value;
	const estado = document.getElementById('usuarioEstado').value;

	const esEdicion = _idEdicionUsuario !== null;
	const id = esEdicion ? _idEdicionUsuario : generarIdUsuario();

	const nuevoUsuario = new Usuario(id, nombre, apellido, email, telefono, tipo, estado);

	const validacion = nuevoUsuario.validar();
	if (!validacion.valido) {
		mostrarAlerta('Error en la validación', validacion.errores.join('<br>'), 'danger');
		return;
	}

	const usuarioExistente = usuarios.findIndex(u => u.id === id);

	if (usuarioExistente !== -1) {
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
		usuarios.push(nuevoUsuario);
		mostrarAlerta('Éxito', `Usuario "${nuevoUsuario.getNombreCompleto()}" registrado correctamente.`, 'success');
	}
	mostrarTablaUsuarios();
	actualizarResumen();
	document.getElementById('formularioUsuario').reset();
	document.getElementById('btnGuardar').textContent = 'Guardar';
	_idEdicionUsuario = null;
}

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

	agregarEventosBotones();
}

function agregarEventosBotones() {
	document.querySelectorAll('.btn-editar').forEach(btn => {
		btn.addEventListener('click', function () {
			const id = this.getAttribute('data-id');
			editarUsuario(id);
		});
	});

	document.querySelectorAll('.btn-eliminar').forEach(btn => {
		btn.addEventListener('click', function () {
			const id = this.getAttribute('data-id');
			eliminarUsuario(id);
		});
	});
}

function editarUsuario(id) {
	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		mostrarAlerta('Error', 'Usuario no encontrado', 'danger');
		return;
	}

	_idEdicionUsuario = usuario.id;

	document.getElementById('usuarioNombre').value = usuario.nombre;
	document.getElementById('usuarioApellido').value = usuario.apellido;
	document.getElementById('usuarioEmail').value = usuario.email;
	document.getElementById('usuarioTelefono').value = usuario.telefono;
	document.getElementById('usuarioTipo').value = usuario.tipo;
	document.getElementById('usuarioEstado').value = usuario.estado;

	const btnGuardar = document.getElementById('btnGuardar');
	btnGuardar.textContent = 'Actualizar';

	document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eliminarUsuario(id) {
	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		mostrarAlerta('Error', 'Usuario no encontrado', 'danger');
		return;
	}

  if (confirm(`¿Está seguro de que desea eliminar a ${usuario.getNombreCompleto()}?`)) {
		usuarios = usuarios.filter(u => u.id !== id);
		mostrarTablaUsuarios();
		actualizarResumen();
		mostrarAlerta('Éxito', `Usuario "${usuario.getNombreCompleto()}" eliminado correctamente.`, 'success');
	}
}

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

function mostrarAlerta(titulo, mensaje, tipo) {
	const alertDiv = document.createElement('div');
	alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
	alertDiv.role = 'alert';
	alertDiv.innerHTML = `
		<strong>${titulo}:</strong> ${mensaje}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
	`;

	const mainElement = document.querySelector('main');
	mainElement.insertBefore(alertDiv, mainElement.firstChild);

	setTimeout(() => {
		alertDiv.remove();
	}, 5000);
}

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
