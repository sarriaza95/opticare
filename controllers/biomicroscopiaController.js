const pool = require('../models/db');// Importar la conexión a la base de datos

async function saveBiomicroscopiaData(req, res) {
  try {
    const expediente_id = parseInt(req.body.expediente_id, 10);

    if (isNaN(expediente_id)) {
      return res.status(400).json({ error: 'expediente_id inválido' });
    }

    // Procesar los archivos subidos
    const odImages = req.files['odImages']
      ? req.files['odImages'].map(file => `/biomicroscopia/${file.filename}`)
      : [];
    const odVideos = req.files['odVideos']
      ? req.files['odVideos'].map(file => `/biomicroscopia/${file.filename}`)
      : [];
    const oiImages = req.files['oiImages']
      ? req.files['oiImages'].map(file => `/biomicroscopia/${file.filename}`)
      : [];
    const oiVideos = req.files['oiVideos']
      ? req.files['oiVideos'].map(file => `/biomicroscopia/${file.filename}`)
      : [];

    // Insertar datos en la base de datos
    const result = await pool.query(
      `INSERT INTO biomicroscopia_archivo 
        (expediente_id, od_images, od_videos, oi_images, oi_videos) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        expediente_id,
        JSON.stringify(odImages),
        JSON.stringify(odVideos),
        JSON.stringify(oiImages),
        JSON.stringify(oiVideos),
      ]
    );

    res.status(200).json({
      message: 'Archivos y datos guardados correctamente',
      data: {
        odImages,
        odVideos,
        oiImages,
        oiVideos,
      },
    });
  } catch (error) {
    console.error('Error al guardar información en la base de datos:', error.message);
    res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  saveBiomicroscopiaData,
};
