const pool = require('../models/db'); // Conexión a la base de datos
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('pdfkit-table'); // Importar pdfkit-table

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

const generarPDFExpediente = (req, res) => {
  try {
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

    const fileName = `expediente-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, `../uploads/${fileName}`);

    // Crear PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath)); // Guardar localmente
    doc.pipe(res); // Enviar al cliente directamente

    // Agregar el logo en la parte superior
    const logoPath = path.join(__dirname, '../uploads/logo_opticare.png'); // Ruta del logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 100 }); // Ajusta la posición y tamaño del logo
      doc.moveDown();
      doc.moveDown();
    }

    doc.fontSize(18).text('Expediente Médico', { align: 'center' });
    doc.moveDown();

    // 1. Antecedentes
    doc.fontSize(14).text('1. Antecedentes');
    doc.fontSize(12).text(`- Personales: ${antecedentes?.personales || 'N/A'}`);
    doc.fontSize(12).text(`- Oculares: ${antecedentes?.oculares || 'N/A'}`);
    doc.moveDown();

    // 2. Lensometría
    doc.fontSize(14).text('2. Lensometría');
    doc.moveDown();
    doc.text('Ojo   ESF   CIL   EJE', { underline: true }); // Cabecera
    doc.text(`OD    ${lensometria.od.esf || 'N/A'}   ${lensometria.od.cil || 'N/A'}   ${lensometria.od.eje || 'N/A'}`);
    doc.text(`OI    ${lensometria.oi.esf || 'N/A'}   ${lensometria.oi.cil || 'N/A'}   ${lensometria.oi.eje || 'N/A'}`);
    doc.text(`Add: ${lensometria.add || 'N/A'}`);
    doc.moveDown();

    // 3. Tipo de Lentes
    doc.fontSize(14).text('3. Tipo de Lentes');
    doc.text(`Tipo: ${tipoLentes.tipoLentes || 'N/A'}`);
    doc.moveDown();

    // 4. Examen Objetivo
    doc.fontSize(14).text('4. Examen Objetivo');
    doc.moveDown();
    doc.fontSize(12).text('Ojo     ESF       CIL       EJE       AVSC', { underline: true }); // Cabecera
    doc.text(
      `OD      ${examenObjetivo.od.esf || 'N/A'}       ${examenObjetivo.od.cil || 'N/A'}       ${examenObjetivo.od.eje || 'N/A'}       ${examenObjetivo.od.avsc || 'N/A'}`
    );
    doc.text(
      `OI      ${examenObjetivo.oi.esf || 'N/A'}       ${examenObjetivo.oi.cil || 'N/A'}       ${examenObjetivo.oi.eje || 'N/A'}       ${examenObjetivo.oi.avsc || 'N/A'}`
    );
    doc.moveDown();

    // 5. RX Final
    doc.fontSize(14).text('5. RX Final');
    doc.moveDown();
    doc.fontSize(12).text('Ojo     ESF       CIL       AVL       AVC       DNP       ALT', { underline: true }); // Cabecera
    doc.text(
      `OD      ${rxFinal.od.esf || 'N/A'}       ${rxFinal.od.cil || 'N/A'}       ${rxFinal.od.avl || 'N/A'}       ${rxFinal.od.avc || 'N/A'}       ${rxFinal.od.dnp || 'N/A'}       ${rxFinal.od.alt || 'N/A'}`
    );
    doc.text(
      `OI      ${rxFinal.oi.esf || 'N/A'}       ${rxFinal.oi.cil || 'N/A'}       ${rxFinal.oi.avl || 'N/A'}       ${rxFinal.oi.avc || 'N/A'}       ${rxFinal.oi.dnp || 'N/A'}       ${rxFinal.oi.alt || 'N/A'}`
    );
    doc.text(`Add: ${rxFinal.add || 'N/A'}`);
    doc.moveDown();

    // 6. Fondo de Ojo
    doc.fontSize(14).text('6. Fondo de Ojo');
    doc.moveDown();
    doc.fontSize(12).text('Ojo     Fondo', { underline: true }); // Cabecera
    doc.text(`OD      ${fondoOjo.od || 'N/A'}`);
    doc.text(`OI      ${fondoOjo.oi || 'N/A'}`);
    doc.moveDown();


    doc.fontSize(14).text('7. Motilidad Ocular');
    doc.text(`OD : ${motilidadOcular.od}`);
    doc.text(`OI : ${motilidadOcular.oi}`);
    doc.text(`AO : ${motilidadOcular.ao}`);
    doc.moveDown();

    doc.fontSize(14).text('8. Cover Test');
    doc.text(`OD : ${coverTest.odVl}`);
    doc.text(`OI : ${coverTest.odVp}`);
    doc.text(`AO : ${coverTest.oiVl}`);
    doc.text(`AO : ${coverTest.oiVp}`);
    doc.moveDown();

    doc.fontSize(14).text('9. PIO');
    doc.text(`odPio : ${pio.odPio}`);
    doc.text(`odPio : ${pio.odPio}`);
    doc.moveDown();

    doc.fontSize(14).text('10. Queratometría');
    doc.fontSize(12).text(`OD : ${queratometria.odKeratometria}`);
    doc.fontSize(12).text(`OI : ${queratometria.oiKeratometria}`);
    doc.moveDown();

    doc.fontSize(14).text('11. Observaciones');
    doc.fontSize(12).text(observaciones.observaciones);
    doc.moveDown();
    
    doc.fontSize(14).text('12. Diagnóstico');
    doc.fontSize(12).text(`Diagnóstico : ${diagnostico.diagnostico}`);
    doc.fontSize(12).text(`Tipo de Lente : ${diagnostico.tiposLentes}`);
    doc.fontSize(12).text(`Observaciones : ${diagnostico.observaciones || 'No hay observaciones'}`);
    doc.fontSize(12).text(`Próxima Cita : ${diagnostico.proximaCita}`);
    doc.moveDown();

    doc.fontSize(14).text('13. Datos Montajes');
    doc.fontSize(12).text(`odH : ${datosMontaje.odH}` );
    doc.fontSize(12).text(`odV : ${datosMontaje.odV}`);
    doc.fontSize(12).text(`oiH : ${datosMontaje.oiH}`);
    doc.fontSize(12).text(`oiV : ${datosMontaje.oiV}`);
    doc.moveDown();
  
    doc.moveDown();
    doc.moveDown();

    // Información del responsable - después de observaciones
    doc.fontSize(12).text('___________________________', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text('Lic. Winston Membreño', { align: 'center' });
    doc.text('Gerente en OptiCare Centro Visual.', { align: 'center' });
    doc.text('Optometrista Médico', { align: 'center' });
    doc.text('Cod MINSA 53138', { align: 'center' });

    // Finalizar PDF
    doc.end();

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/pdf');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
};

module.exports = { obtenerClientes, getClienteById, updateCliente, getExpedientesByCliente, getExpedienteDetalle, eliminarCliente, obtenerBiomicroscopia, updateExpediente, generarPDFExpediente };