const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Importar rutas
const formRoutes = require('./routes/formRoutes');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api', formRoutes);

// Ruta estática para la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
