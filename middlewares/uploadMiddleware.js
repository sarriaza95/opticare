const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta existe
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configurar almacenamiento para los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/biomicroscopia';
    ensureDirExists(dir); // Crear la carpeta si no existe
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Crear el middleware con configuración
const upload = multer({ storage });

module.exports = upload;
