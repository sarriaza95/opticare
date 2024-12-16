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
        SELECT od_images, oi_videos, oi_images, od_videos
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
      const oiImages = typeof row.oi_images === 'string' ? JSON.parse(row.oi_images) : row.oi_images;
      const odVideos = typeof row.od_videos === 'string' ? JSON.parse(row.od_videos) : row.od_videos;
  
      res.json({
        od_images: odImages,
        oi_videos: oiVideos,
        oi_images: oiImages,
        od_videos: odVideos,
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

const updateExpediente = async (req, res) => {
  const expedienteId = req.params.id;
  const {
    antecedentes,
    lensometria,
    tipoLentes,
    examenObjetivo,
    rxFinal,
    biomicroscopia,
    fondoOjo,
    motilidadOcular,
    coverTest,
    pio,
    diagnostico,
    datosMontaje,
    queratometria,
    observaciones,
  } = req.body;

  try {
    // Iniciar una transacción para asegurar la integridad de los datos
    await pool.query('BEGIN');

    // 1. Actualizar antecedentes
    if (antecedentes) {
      await pool.query(
        `UPDATE antecedentes SET personales = $1, oculares = $2 WHERE expediente_id = $3`,
        [antecedentes.personales, antecedentes.oculares, expedienteId]
      );
    }

    // 2. Actualizar lensometría
    if (lensometria) {
      await pool.query(
        `UPDATE lensometria SET 
          od_esf = $1, od_cil = $2, od_eje = $3,
          oi_esf = $4, oi_cil = $5, oi_eje = $6, add = $7
         WHERE expediente_id = $8`,
        [
          lensometria.od.esf, lensometria.od.cil, lensometria.od.eje,
          lensometria.oi.esf, lensometria.oi.cil, lensometria.oi.eje,
          lensometria.add, expedienteId,
        ]
      );
    }

    // 3. Actualizar tipo de lentes
    if (tipoLentes) {
      await pool.query(
        `UPDATE tipo_lentes SET tipo_lentes = $1 WHERE expediente_id = $2`,
        [tipoLentes.tipoLentes, expedienteId]
      );
    }

    // 4. Actualizar examen objetivo
    if (examenObjetivo) {
      await pool.query(
        `UPDATE examen_objetivo SET 
          od_esf = $1, od_cil = $2, od_eje = $3, od_avsc = $4,
          oi_esf = $5, oi_cil = $6, oi_eje = $7, oi_avsc = $8
         WHERE expediente_id = $9`,
        [
          examenObjetivo.od.esf, examenObjetivo.od.cil, examenObjetivo.od.eje, examenObjetivo.od.avsc,
          examenObjetivo.oi.esf, examenObjetivo.oi.cil, examenObjetivo.oi.eje, examenObjetivo.oi.avsc,
          expedienteId,
        ]
      );
    }

    // 5. Actualizar rxFinal
    if (rxFinal) {
      await pool.query(
        `UPDATE rx_final SET 
          od_esf = $1, od_cil = $2, od_eje = $3, od_avl = $4, od_avc = $5, od_dnp = $6, od_alt = $7,
          oi_esf = $8, oi_cil = $9, oi_eje = $10, oi_avl = $11, oi_avc = $12, oi_dnp = $13, oi_alt = $14,
          add = $15 WHERE expediente_id = $16`,
        [
          rxFinal.od.esf, rxFinal.od.cil, rxFinal.od.eje, rxFinal.od.avl, rxFinal.od.avc, rxFinal.od.dnp, rxFinal.od.alt,
          rxFinal.oi.esf, rxFinal.oi.cil, rxFinal.oi.eje, rxFinal.oi.avl, rxFinal.oi.avc, rxFinal.oi.dnp, rxFinal.oi.alt,
          rxFinal.add, expedienteId,
        ]
      );
    }

    // 7. Actualizar fondo de ojo
    if (fondoOjo) {
      await pool.query(
        `UPDATE fondo_ojo SET od = $1, oi = $2 WHERE expediente_id = $3`,
        [fondoOjo.od, fondoOjo.oi, expedienteId]
      );
    }

    // 8. Actualizar motilidad ocular
    if (motilidadOcular) {
      await pool.query(
        `UPDATE motilidad_ocular SET od = $1, oi = $2, ao = $3 WHERE expediente_id = $4`,
        [motilidadOcular.od, motilidadOcular.oi, motilidadOcular.ao, expedienteId]
      );
    }

    // 9. Actualizar cover test
    if (coverTest) {
      await pool.query(
        `UPDATE cover_test SET 
          od_vl = $1, od_vp = $2, oi_vl = $3, oi_vp = $4 
         WHERE expediente_id = $5`,
        [coverTest.odVl, coverTest.odVp, coverTest.oiVl, coverTest.oiVp, expedienteId]
      );
    }

    // 10. Actualizar pio
    if (pio) {
      await pool.query(
        `UPDATE pio SET od_pio = $1, oi_pio = $2 WHERE expediente_id = $3`,
        [pio.odPio, pio.oiPio, expedienteId]
      );
    }

    // 11. Actualizar datos montaje
    if (datosMontaje) {
      await pool.query(
        `UPDATE datos_montaje SET 
          od_h = $1, od_v = $2, oi_h = $3, oi_v = $4
         WHERE expediente_id = $5`,
        [datosMontaje.odH, datosMontaje.odV, datosMontaje.oiH, datosMontaje.oiV, expedienteId]
      );
    }

    // 12. Actualizar queratometría
    if (queratometria) {
      await pool.query(
        `UPDATE queratometria SET od_keratometria = $1, oi_keratometria = $2 WHERE expediente_id = $3`,
        [queratometria.odKeratometria, queratometria.oiKeratometria, expedienteId]
      );
    }

    // 13. Actualizar observaciones
    if (observaciones) {
      await pool.query(
        `UPDATE observaciones SET observaciones = $1 WHERE expediente_id = $2`,
        [observaciones.observaciones, expedienteId]
      );
    }
    
    // Ejemplo para "diagnostico"
    if (diagnostico) {
      await pool.query(
        `UPDATE diagnostico SET 
          diagnostico = $1, tipos_lentes = $2, proxima_cita = $3, observaciones = $4 
         WHERE expediente_id = $5`,
        [diagnostico.diagnostico, diagnostico.tiposLentes, diagnostico.proximaCita, diagnostico.observaciones, expedienteId]
      );
    }

    // 6. Confirmar transacción
    await pool.query('COMMIT');

    res.status(200).json({ message: 'Expediente actualizado correctamente' });
  } catch (error) {
    // Revertir transacción en caso de error
    await pool.query('ROLLBACK');
    console.error('Error al actualizar expediente:', error);
    res.status(500).json({ error: 'Error al actualizar expediente' });
  }
};

module.exports = { obtenerClientes, getClienteById, updateCliente, getExpedientesByCliente, getExpedienteDetalle, eliminarCliente, obtenerBiomicroscopia, updateExpediente };