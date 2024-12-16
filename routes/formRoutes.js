const express = require('express');
const { saveFormData, saveFormDataCita } = require('../controllers/formControllers');
const upload = require('../middlewares/uploadMiddleware');
const { saveBiomicroscopiaData } = require('../controllers/biomicroscopiaController');
const { obtenerClientes, getClienteById, updateCliente, getExpedientesByCliente, getExpedienteDetalle, eliminarCliente, obtenerBiomicroscopia, updateExpediente } = require('../controllers/getClienteController');

const router = express.Router();

// Ruta para guardar datos del formulario
router.post('/save-form', saveFormData);
router.post(
  '/upload-files',
  upload.fields([{ name: 'odImages', maxCount: 5 }, { name: 'odVideos', maxCount: 5 }, { name: 'oiImages', maxCount: 5 }, { name: 'oiVideos', maxCount: 5 }]),
  saveBiomicroscopiaData
);
// Ruta para obtener los datos de los clientes
router.get('/clientes', obtenerClientes);

// Obtener la información de un cliente por ID
router.get('/clientes/:id', getClienteById);

// Actualizar la información de un cliente
router.put('/clientes/:id', updateCliente);

// Ruta para eliminar un cliente
router.delete('/clientes/:id', eliminarCliente);

router.get('/biomicroscopia/:id', obtenerBiomicroscopia);

router.post('/save-form-cita/:id', saveFormDataCita);

// Definición de la ruta para obtener los expedientes de un cliente
router.get('/expedientes/:cliente_id', getExpedientesByCliente);

// Ruta para obtener los detalles de un expediente específico
router.get('/expedientes-detalle/:expediente_id', getExpedienteDetalle);

// Ruta para actualizar un expediente
router.put('/:id', updateExpediente);
module.exports = router;
