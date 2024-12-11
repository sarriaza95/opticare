const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const formRoutes = require('./routes/formRoutes');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api', formRoutes);

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
