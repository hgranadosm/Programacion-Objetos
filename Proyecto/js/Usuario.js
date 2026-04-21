class Usuario {
	constructor(id, nombre, apellido, email, telefono = '', tipo = 'Estudiante', estado = 'Activo') {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.email = email;
		this.telefono = telefono;
		this.tipo = tipo;
		this.estado = estado;
		this.fechaRegistro = new Date().toISOString();
	}

	getNombreCompleto() {
		return `${this.nombre} ${this.apellido}`;
	}

	validar() {
		const errores = [];

		if (!this.nombre || this.nombre.trim() === '') {
			errores.push('El nombre es obligatorio');
		}

		if (!this.apellido || this.apellido.trim() === '') {
			errores.push('El apellido es obligatorio');
		}

		if (!this.email || this.email.trim() === '') {
			errores.push('El email es obligatorio');
		} else if (!this.validarEmail(this.email)) {
			errores.push('El formato del email no es válido');
		}

		if (this.telefono && !this.validarTelefono(this.telefono)) {
			errores.push('El formato del teléfono no es válido');
		}

		if (!this.tipo) {
			errores.push('El tipo de usuario es obligatorio');
		}

		if (!this.estado) {
			errores.push('El estado es obligatorio');
		}

		return {
			valido: errores.length === 0,
			errores: errores
		};
	}

	validarEmail(email) {
		const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regexEmail.test(email);
	}

	validarTelefono(telefono) {
		const regexTelefono = /^\d{4}-\d{4}$/;
		return regexTelefono.test(telefono);
	}

	toJSON() {
		return JSON.stringify({
			id: this.id,
			nombre: this.nombre,
			apellido: this.apellido,
			email: this.email,
			telefono: this.telefono,
			tipo: this.tipo,
			estado: this.estado,
			fechaRegistro: this.fechaRegistro
		});
	}

	static fromJSON(datos) {
		const usuario = new Usuario(
			datos.id,
			datos.nombre,
			datos.apellido,
			datos.email,
			datos.telefono || '',
			datos.tipo || 'Estudiante',
			datos.estado || 'Activo'
		);
		if (datos.fechaRegistro) {
			usuario.fechaRegistro = datos.fechaRegistro;
		}
		return usuario;
	}

	toString() {
		return `Usuario: ${this.getNombreCompleto()} (${this.email}) - ${this.tipo} - ${this.estado}`;
	}

	esIgual(otroUsuario) {
		return this.id === otroUsuario.id;
	}

	actualizar(datos) {
		if (datos.nombre) this.nombre = datos.nombre;
		if (datos.apellido) this.apellido = datos.apellido;
		if (datos.email) this.email = datos.email;
		if (datos.telefono !== undefined) this.telefono = datos.telefono;
		if (datos.tipo) this.tipo = datos.tipo;
		if (datos.estado) this.estado = datos.estado;
	}

	getEstadoBadge() {
		if (this.estado === 'Activo') {
			return '<span class="badge bg-success">Activo</span>';
		} else {
			return '<span class="badge bg-danger">Inactivo</span>';
		}
	}

	getTipoConIcono() {
		const iconos = {
			'Estudiante': '<i class="fa-solid fa-graduation-cap"></i>',
			'Profesor': '<i class="fa-solid fa-chalkboard-user"></i>',
			'Personal': '<i class="fa-solid fa-id-badge"></i>'
		};
		return (iconos[this.tipo] || '') + ' ' + this.tipo;
	}
}
