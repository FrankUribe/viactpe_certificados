const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3500
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '12mb' }));
app.use(bodyParser.urlencoded({ limit: '12mb', extended: true }));
app.use(express.json());


//Routes
app.use(require('./routes/certificados'));
// Route
app.get('/', (req, res) => {
  res.send('POS API!');
});

// Middleware para verificar la key en las solicitudes
const verifyKey = (req, res, next) => {
  const key = req.query.key; // Recibimos la key como parámetro de la query
  const validKey = 'viactToken'; // Key que debe ser validada (esto debería estar más protegido en un entorno real)

  if (key === validKey) {
    next(); // Si la key es válida, pasa al siguiente middleware
  } else {
    res.status(403).send('Acceso denegado: clave incorrecta');
  }
};
app.use('/certificados', verifyKey, express.static(path.join(__dirname, 'certificados')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));