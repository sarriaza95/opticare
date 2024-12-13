const pool = require('../models/db'); // Conexión a la base de datos

// Controlador para obtener los datos de clientes
const obtenerClientes = async (req, res) => {
  try {
    const query = `
      SELECT 
      cliente_id,
        nombre, 
        fecha, 
        edad, 
        ultima_consulta,
        contacto,
        ocupacion 
      FROM clientes;
    `;
    const result = await pool.query(query);

    res.status(200).json({
      message: 'Datos obtenidos exitosamente',
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener los datos de clientes:', error.message);
    res.status(500).json({
      error: 'Error al obtener los datos de clientes',
    });
  }
  
};
// Obtener la información de un cliente por su ID
const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
      const query = 'SELECT cliente_id, nombre, fecha_nacimiento, edad, ultima_consulta, contacto, ocupacion FROM clientes WHERE id = $1';
      const result = await pool.query(query, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
  
      res.status(200).json({
        message: 'Información del cliente obtenida exitosamente',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error al obtener información del cliente:', error.message);
      res.status(500).json({ error: 'Error al obtener información del cliente' });
    }
  }
  
  // Actualizar la información de un cliente
  const updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha, edad, ultima_consulta, contacto, ocupacion } = req.body;
  
    try {
      const query = `
        UPDATE clientes
        SET nombre = $1, fecha = $2, edad = $3, ultima_consulta = $4, contacto = $5, ocupacion = $6
        WHERE cliente_id = $7
        RETURNING *;
      `;
      const values = [nombre, fecha, edad, ultima_consulta, contacto, ocupacion, id];
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
  
      res.status(200).json({
        message: 'Información del cliente actualizada exitosamente',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error al actualizar información del cliente:', error.message);
      res.status(500).json({ error: 'Error al actualizar información del cliente' });
    }
  }
  const eliminarCliente = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM clientes WHERE cliente_id = $1', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
  
      res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
  }
  const obtenerBiomicroscopia = async (req, res) => {
    try {
      const { id } = req.params;
      const query = `
        SELECT od_images, oi_videos
        FROM biomicroscopia_archivo
        WHERE expediente_id = $1
      `;
      const { rows } = await pool.query(query, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Datos no encontrados' });
      }
  
      const row = rows[0];
  
      // Convertir las columnas a JSON si no lo son
      const odImages = typeof row.od_images === 'string' ? JSON.parse(row.od_images) : row.od_images;
      const oiVideos = typeof row.oi_videos === 'string' ? JSON.parse(row.oi_videos) : row.oi_videos;
  
      res.json({
        od_images: odImages,
        oi_videos: oiVideos,
      });
    } catch (error) {
      console.error('Error obteniendo datos de biomicroscopia:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
  
  // Controlador para obtener expedientes de un cliente
const getExpedientesByCliente = async (req, res) => {
  const clienteId = req.params.cliente_id;

  try {
      const result = await pool.query(
          'SELECT expediente_id, fecha_creacion FROM expedientes WHERE cliente_id = $1 ORDER BY fecha_creacion DESC',
          [clienteId]
      );
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error al obtener los expedientes:', error);
      res.status(500).json({ error: 'Error al obtener los expedientes.' });
  }
}
// Controlador para obtener los datos relacionados a un expediente específico
const getExpedienteDetalle = async (req, res) => {
  const { expediente_id } = req.params; // Extraer expediente_id de los parámetros

  try {
      // Consultar el expediente principal
      const expedienteResult = await pool.query('SELECT * FROM expedientes WHERE expediente_id = $1', [expediente_id]);
      if (expedienteResult.rowCount === 0) {
          return res.status(404).json({ error: 'Expediente no encontrado' });
      }
      const expediente = expedienteResult.rows[0];

      // Consultar datos relacionados al expediente
      const antecedentes = await pool.query('SELECT * FROM antecedentes WHERE expediente_id = $1', [expediente_id]);
      const lensometria = await pool.query('SELECT * FROM lensometria WHERE expediente_id = $1', [expediente_id]);
      const tipoLentes = await pool.query('SELECT * FROM tipo_lentes WHERE expediente_id = $1', [expediente_id]);
      const examenObjetivo = await pool.query('SELECT * FROM examen_objetivo WHERE expediente_id = $1', [expediente_id]);
      const rxFinal = await pool.query('SELECT * FROM rx_final WHERE expediente_id = $1', [expediente_id]);
      const fondoOjo = await pool.query('SELECT * FROM fondo_ojo WHERE expediente_id = $1', [expediente_id]);
      const motilidadOcular = await pool.query('SELECT * FROM motilidad_ocular WHERE expediente_id = $1', [expediente_id]);
      const pio = await pool.query('SELECT * FROM pio WHERE expediente_id = $1', [expediente_id]);
      const diagnostico = await pool.query('SELECT * FROM diagnostico WHERE expediente_id = $1', [expediente_id]);
      const datosMontaje = await pool.query('SELECT * FROM datos_montaje WHERE expediente_id = $1', [expediente_id]);
      const coverTest = await pool.query('SELECT * FROM cover_test WHERE expediente_id = $1', [expediente_id]);
      const queratometria = await pool.query('SELECT * FROM queratometria WHERE expediente_id = $1', [expediente_id]);
      const observaciones = await pool.query('SELECT * FROM observaciones WHERE expediente_id = $1', [expediente_id]);
      const biomicroscopia = await pool.query('SELECT * FROM biomicroscopia_archivo WHERE expediente_id = $1', [expediente_id]);

      // Organizar la información
      const data = {
          expediente,
          antecedentes: antecedentes.rows,
          lensometria: lensometria.rows,
          tipoLentes: tipoLentes.rows,
          examenObjetivo: examenObjetivo.rows,
          rxFinal: rxFinal.rows,
          fondoOjo: fondoOjo.rows,
          motilidadOcular: motilidadOcular.rows,
          pio: pio.rows,
          diagnostico: diagnostico.rows,
          datosMontaje: datosMontaje.rows,
          coverTest: coverTest.rows,
          queratometria: queratometria.rows,
          observaciones: observaciones.rows,
          biomicroscopia: biomicroscopia.rows,
      };

      res.status(200).json(data);
  } catch (error) {
      console.error('Error al obtener el expediente:', error);
      res.status(500).json({ error: 'Error al obtener el expediente.' });
  }
};

module.exports = { obtenerClientes, getClienteById, updateCliente, getExpedientesByCliente, getExpedienteDetalle, eliminarCliente, obtenerBiomicroscopia };