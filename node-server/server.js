const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'prestamos.json');

async function leerPrestamos() {
  try {
    const contenido = await fs.readFile(DATA_FILE, 'utf8');
    const datos = JSON.parse(contenido);
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
      return [];
    }
    throw error;
  }
}

async function guardarPrestamos(prestamos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(prestamos, null, 2) + '\n', 'utf8');
}

function validarPrestamo(prestamo) {
  const estadosPermitidos = ['Activo', 'Devuelto', 'Atrasado', 'Pendiente'];
  const campos = ['id', 'usuario', 'libro', 'fechaPrestamo', 'fechaDevolucion', 'estado'];

  for (const campo of campos) {
    if (!prestamo[campo] || String(prestamo[campo]).trim() === '') {
      return `El campo ${campo} es obligatorio`;
    }
  }

  const multaNumero = Number(prestamo.multa ?? 0);
  if (!Number.isFinite(multaNumero) || multaNumero < 0) {
    return 'La multa debe ser un numero mayor o igual a 0';
  }

  if (!estadosPermitidos.includes(prestamo.estado)) {
    return 'El estado no es valido';
  }

  if (prestamo.fechaDevolucion < prestamo.fechaPrestamo) {
    return 'La fecha de devolucion no puede ser anterior a la fecha de prestamo';
  }

  return null;
}

app.get('/api/prestamos', async (req, res) => {
  try {
    const prestamos = await leerPrestamos();
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudieron cargar los prestamos' });
  }
});

app.post('/api/prestamo', async (req, res) => {
  try {
    const prestamos = await leerPrestamos();

    const maxId = prestamos.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    const nuevoId = String(maxId + 1);

    const prestamo = {
      id: nuevoId,
      usuario: String(req.body.usuario || req.body.usuarioId || '').trim(),
      libro: String(req.body.libro || req.body.libroId || '').trim(),
      usuarioId: String(req.body.usuarioId || req.body.usuario || '').trim(),
      libroId: String(req.body.libroId || req.body.libro || '').trim(),
      fechaPrestamo: String(req.body.fechaPrestamo || '').trim(),
      fechaDevolucion: String(req.body.fechaDevolucion || '').trim(),
      estado: String(req.body.estado || '').trim(),
      multa: Number(req.body.multa ?? 0)
    };

    const errorValidacion = validarPrestamo(prestamo);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    prestamos.push(prestamo);
    await guardarPrestamos(prestamos);

    return res.status(201).json({ mensaje: 'Prestamo registrado correctamente', prestamo });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo registrar el prestamo' });
  }
});

app.put('/api/prestamo/:id', async (req, res) => {
  try {
    const idParam = String(req.params.id).trim();
    const prestamos = await leerPrestamos();
    const index = prestamos.findIndex(item => String(item.id) === idParam);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Prestamo no encontrado' });
    }

    const actualizado = {
      id: idParam,
      usuario: String(req.body.usuario || req.body.usuarioId || '').trim(),
      libro: String(req.body.libro || req.body.libroId || '').trim(),
      usuarioId: String(req.body.usuarioId || req.body.usuario || '').trim(),
      libroId: String(req.body.libroId || req.body.libro || '').trim(),
      fechaPrestamo: String(req.body.fechaPrestamo || '').trim(),
      fechaDevolucion: String(req.body.fechaDevolucion || '').trim(),
      estado: String(req.body.estado || '').trim(),
      multa: Number(req.body.multa ?? 0)
    };

    const errorValidacion = validarPrestamo(actualizado);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    prestamos[index] = actualizado;
    await guardarPrestamos(prestamos);

    return res.json({ mensaje: 'Prestamo actualizado correctamente', prestamo: actualizado });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo actualizar el prestamo' });
  }
});

app.delete('/api/prestamo/:id', async (req, res) => {
  try {
    const idParam = String(req.params.id).trim();
    const prestamos = await leerPrestamos();
    const index = prestamos.findIndex(item => String(item.id) === idParam);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Prestamo no encontrado' });
    }

    prestamos.splice(index, 1);
    await guardarPrestamos(prestamos);

    return res.json({ mensaje: 'Prestamo eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo eliminar el prestamo' });
  }
});

app.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000');
});
