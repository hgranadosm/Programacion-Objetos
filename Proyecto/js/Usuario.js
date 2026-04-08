/**
 * Clase Usuario
 * Representa un usuario de la biblioteca
 */
class Usuario {
	/**
	 * Constructor de la clase Usuario
	 * @param {string} id - Identificador único del usuario
	 * @param {string} nombre - Nombre del usuario
	 * @param {string} apellido - Apellido del usuario
	 * @param {string} email - Correo electrónico del usuario
	 * @param {string} telefono - Número de teléfono del usuario
	 * @param {string} tipo - Tipo de usuario (Estudiante, Profesor, Personal)
	 * @param {string} estado - Estado del usuario (Activo, Inactivo)
	 */
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

	/**
	 * Obtiene el nombre completo del usuario
	 * @returns {string} Nombre completo del usuario
	 */
	getNombreCompleto() {
		return `${this.nombre} ${this.apellido}`;
	}

	/**
	 * Valida si los datos del usuario son correctos
	 * @returns {object} Objeto con propiedades válidas: {valido: boolean, errores: array}
	 */
	validar() {
		const errores = [];

		if (!this.id || this.id.trim() === '') {
			errores.push('El ID es obligatorio');
		}

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

	/**
	 * Valida el formato del email
	 * @param {string} email - Email a validar
	 * @returns {boolean} True si el email es válido
	 */
	validarEmail(email) {
		const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regexEmail.test(email);
	}

	/**
	 * Valida el formato del teléfono
	 * @param {string} telefono - Teléfono a validar
	 * @returns {boolean} True si el teléfono es válido
	 */
	validarTelefono(telefono) {
		const regexTelefono = /^\d{4}-\d{4}$/;
		return regexTelefono.test(telefono);
	}

	/**
	 * Convierte el objeto Usuario a JSON
	 * @returns {string} Representación JSON del usuario
	 */
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

	/**
	 * Crea un Usuario a partir de un objeto JSON
	 * @param {object} datos - Objeto con los datos del usuario
	 * @returns {Usuario} Instancia de Usuario
	 */
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

	/**
	 * Obtiene una representación en texto del usuario
	 * @returns {string} Información formateada del usuario
	 */
	toString() {
		return `Usuario: ${this.getNombreCompleto()} (${this.email}) - ${this.tipo} - ${this.estado}`;
	}

	/**
	 * Compara dos usuarios por ID
	 * @param {Usuario} otroUsuario - Usuario a comparar
	 * @returns {boolean} True si tienen el mismo ID
	 */
	esIgual(otroUsuario) {
		return this.id === otroUsuario.id;
	}

	/**
	 * Actualiza los datos del usuario
	 * @param {object} datos - Objeto con los nuevos datos
	 */
	actualizar(datos) {
		if (datos.nombre) this.nombre = datos.nombre;
		if (datos.apellido) this.apellido = datos.apellido;
		if (datos.email) this.email = datos.email;
		if (datos.telefono !== undefined) this.telefono = datos.telefono;
		if (datos.tipo) this.tipo = datos.tipo;
		if (datos.estado) this.estado = datos.estado;
	}

	/**
	 * Obtiene el estado del usuario como HTML con badge
	 * @returns {string} HTML con badge de estado
	 */
	getEstadoBadge() {
		if (this.estado === 'Activo') {
			return '<span class="badge bg-success">Activo</span>';
		} else {
			return '<span class="badge bg-danger">Inactivo</span>';
		}
	}

	/**
	 * Obtiene el tipo de usuario con icono
	 * @returns {string} HTML con icono del tipo
	 */
	getTipoConIcono() {
		const iconos = {
			'Estudiante': '<i class="fa-solid fa-graduation-cap"></i>',
			'Profesor': '<i class="fa-solid fa-chalkboard-user"></i>',
			'Personal': '<i class="fa-solid fa-id-badge"></i>'
		};
		return (iconos[this.tipo] || '') + ' ' + this.tipo;
	}
}
