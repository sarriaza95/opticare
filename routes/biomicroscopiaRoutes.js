const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { saveBiomicroscopiaData } = require('../controllers/biomicroscopiaController');

const router = express.Router();

// Ruta para subir archivos y guardarlos en la base de datos
router.post(
  '/upload-files',
  upload.fields([{ name: 'odImages', maxCount: 5 }, { name: 'oiVideos', maxCount: 5 }]),
  saveBiomicroscopiaData
);

module.exports = router;
