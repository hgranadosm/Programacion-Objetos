const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/prestamo', (req, res) => {
  console.log('Nuevo préstamo registrado:');
  console.log(req.body);
  res.json({ mensaje: 'Préstamo recibido correctamente' });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000');
});
