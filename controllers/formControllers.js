const pool = require('../models/db');

const saveFormData = async (req, res) => {
  try {
    const {
        personalInfo,
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

    // Realizar el guardado en la base de datos
    const clientResult = await pool.query(
        `INSERT INTO clientes (nombre, fecha, fecha_nacimiento, ultima_consulta, edad, contacto, ocupacion, motivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING cliente_id`,
        [
          personalInfo.nombre,
          personalInfo.fecha,
          personalInfo.fechaNacimiento,
          personalInfo.ultimaConsulta,
          personalInfo.edad,
          personalInfo.contacto,
          personalInfo.ocupacion,
          personalInfo.motivo,
        ]
      );
  
      const clienteId = clientResult.rows[0].cliente_id;

      // 2. Guardar información del expediente relacionada con el cliente
    const expedienteResult = await pool.query(
        `INSERT INTO expedientes (cliente_id, fecha_creacion) VALUES ($1, $2) RETURNING expediente_id`,
        [clienteId, personalInfo.fecha]
      );

      const expedienteId = expedienteResult.rows[0].expediente_id;
  
      const promises = [
        // Guardar antecedentes
        pool.query(
          `INSERT INTO antecedentes (expediente_id, personales, oculares) VALUES ($1, $2, $3)`,
          [expedienteId, antecedentes.personales, antecedentes.oculares]
        ),
  
        // Guardar lensometría
        pool.query(
          `INSERT INTO lensometria (expediente_id, od_esf, od_cil, od_eje, oi_esf, oi_cil, oi_eje, add)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            expedienteId,
            lensometria.od.esf,
            lensometria.od.cil,
            lensometria.od.eje,
            lensometria.oi.esf,
            lensometria.oi.cil,
            lensometria.oi.eje,
            lensometria.add,
          ]
        ),
  
        // Guardar tipo de lentes
        pool.query(
          `INSERT INTO tipo_lentes (expediente_id, tipo_lentes) VALUES ($1, $2)`,
          [expedienteId, tipoLentes.tipoLentes]
        ),
  
        // Guardar examen objetivo
        pool.query(
          `INSERT INTO examen_objetivo (expediente_id, od_esf, od_cil, od_eje, od_avsc, oi_esf, oi_cil, oi_eje, oi_avsc)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            expedienteId,
            examenObjetivo.od.esf,
            examenObjetivo.od.cil,
            examenObjetivo.od.eje,
            examenObjetivo.od.avsc,
            examenObjetivo.oi.esf,
            examenObjetivo.oi.cil,
            examenObjetivo.oi.eje,
            examenObjetivo.oi.avsc,
          ]
        ),
  
        // Guardar datos en la receta final
        pool.query(
          `INSERT INTO rx_final (expediente_id, od_esf, od_cil, od_eje, od_avl, od_avc, od_dnp, od_alt, oi_esf, oi_cil, oi_eje, oi_avl, oi_avc, oi_dnp, oi_alt, add)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            expedienteId,
            rxFinal.od.esf,
            rxFinal.od.cil,
            rxFinal.od.eje,
            rxFinal.od.avl,
            rxFinal.od.avc,
            rxFinal.od.dnp,
            rxFinal.od.alt,
            rxFinal.oi.esf,
            rxFinal.oi.cil,
            rxFinal.oi.eje,
            rxFinal.oi.avl,
            rxFinal.oi.avc,
            rxFinal.oi.dnp,
            rxFinal.oi.alt,
            rxFinal.add,
          ]
        ),
  
        /* // Guardar biomicroscopia
        pool.query(
          `INSERT INTO biomicroscopia (expediente_id, od_images,od_videos, oi_images, oi_videos) VALUES ($1, $2, $3, $4, $5)`,
          [clienteId, biomicroscopia.od.images, biomicroscopia.od.images, biomicroscopia.oi.images]
        ), */
  
        // Guardar información de fondo ocular
        pool.query( 
          `INSERT INTO fondo_ojo (expediente_id, od, oi) VALUES ($1, $2, $3)`,
          [expedienteId, fondoOjo.od, fondoOjo.oi]
        ),
  
        // Guardar motilidad ocular
        pool.query(
          `INSERT INTO motilidad_ocular (expediente_id, od, oi, ao) VALUES ($1, $2, $3, $4)`,
          [expedienteId, motilidadOcular.od, motilidadOcular.oi, motilidadOcular.ao]
        ),
  
        // Guardar presion intraocular
        pool.query(
          `INSERT INTO pio (expediente_id, od_pio, oi_pio) VALUES ($1, $2, $3)`,
          [expedienteId, pio.odPio, pio.oiPio]
        ),
  
        // Guardar diagnóstico
        pool.query(
          `INSERT INTO diagnostico (expediente_id, diagnostico, tipos_lentes, proxima_cita, observaciones)
           VALUES ($1, $2, $3, $4, $5)`,
          [expedienteId, diagnostico.diagnostico, diagnostico.tiposLentes, diagnostico.proximaCita, diagnostico.observaciones]
        ),
  
        // Guardar datos de montaje
        pool.query(
          `INSERT INTO datos_montaje (expediente_id, od_h, od_v, oi_h, oi_v) VALUES ($1, $2, $3, $4, $5)`,
          [expedienteId, datosMontaje.odH, datosMontaje.odV, datosMontaje.oiH, datosMontaje.oiV]
        ),

        // Guardar cover test
        pool.query(
            `INSERT INTO cover_test (expediente_id, od_vl, od_vp, oi_vl, oi_vp) VALUES ($1, $2, $3, $4, $5)`,
            [expedienteId, coverTest.odVl, coverTest.odVp, coverTest.oiVl, coverTest.oiVp]
        ),

        // Guardar queratometria
        pool.query(
            `INSERT INTO queratometria (expediente_id, od_keratometria, oi_keratometria) VALUES ($1, $2, $3)`,
            [expedienteId, queratometria.odKeratometria, queratometria.oiKeratometria]
        ),

        // Guardar observaciones
        pool.query(
            `INSERT INTO observaciones (expediente_id, observaciones) VALUES ($1, $2)`,
            [expedienteId, observaciones.observaciones]
        ),
      ];
  
      await Promise.all(promises);
  
      res.status(200).json({ message: 'Datos guardados exitosamente', expedienteId});
    } catch (error) {
      console.error('Error al guardar datos:', error);
      res.status(500).json({ error: 'Error al guardar los datos' });
    }
};
const saveFormDataCita = async (req, res) => {
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
  
        const { id } = req.params;

        const clienteId = id

        const fecha = new Date();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
        const dia = String(fecha.getDate()).padStart(2, '0');

        const fecha_envio = anio +'/'+mes+'/'+dia
  
        // 2. Guardar información del expediente relacionada con el cliente
      const expedienteResult = await pool.query(
          `INSERT INTO expedientes (cliente_id, fecha_creacion) VALUES ($1, $2) RETURNING expediente_id`,
          [clienteId, fecha_envio]
        );
  
        const expedienteId = expedienteResult.rows[0].expediente_id;
    
        const promises = [
          // Guardar antecedentes
          pool.query(
            `INSERT INTO antecedentes (expediente_id, personales, oculares) VALUES ($1, $2, $3)`,
            [expedienteId, antecedentes.personales, antecedentes.oculares]
          ),
    
          // Guardar lensometría
          pool.query(
            `INSERT INTO lensometria (expediente_id, od_esf, od_cil, od_eje, oi_esf, oi_cil, oi_eje, add)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              expedienteId,
              lensometria.od.esf,
              lensometria.od.cil,
              lensometria.od.eje,
              lensometria.oi.esf,
              lensometria.oi.cil,
              lensometria.oi.eje,
              lensometria.add,
            ]
          ),
    
          // Guardar tipo de lentes
          pool.query(
            `INSERT INTO tipo_lentes (expediente_id, tipo_lentes) VALUES ($1, $2)`,
            [expedienteId, tipoLentes.tipoLentes]
          ),
    
          // Guardar examen objetivo
          pool.query(
            `INSERT INTO examen_objetivo (expediente_id, od_esf, od_cil, od_eje, od_avsc, oi_esf, oi_cil, oi_eje, oi_avsc)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              expedienteId,
              examenObjetivo.od.esf,
              examenObjetivo.od.cil,
              examenObjetivo.od.eje,
              examenObjetivo.od.avsc,
              examenObjetivo.oi.esf,
              examenObjetivo.oi.cil,
              examenObjetivo.oi.eje,
              examenObjetivo.oi.avsc,
            ]
          ),
    
          // Guardar datos en la receta final
          pool.query(
            `INSERT INTO rx_final (expediente_id, od_esf, od_cil, od_eje, od_avl, od_avc, od_dnp, od_alt, oi_esf, oi_cil, oi_eje, oi_avl, oi_avc, oi_dnp, oi_alt, add)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [
              expedienteId,
              rxFinal.od.esf,
              rxFinal.od.cil,
              rxFinal.od.eje,
              rxFinal.od.avl,
              rxFinal.od.avc,
              rxFinal.od.dnp,
              rxFinal.od.alt,
              rxFinal.oi.esf,
              rxFinal.oi.cil,
              rxFinal.oi.eje,
              rxFinal.oi.avl,
              rxFinal.oi.avc,
              rxFinal.oi.dnp,
              rxFinal.oi.alt,
              rxFinal.add,
            ]
          ),
    
          /* // Guardar biomicroscopia
          pool.query(
            `INSERT INTO biomicroscopia (expediente_id, od_images,od_videos, oi_images, oi_videos) VALUES ($1, $2, $3, $4, $5)`,
            [clienteId, biomicroscopia.od.images, biomicroscopia.od.images, biomicroscopia.oi.images]
          ), */
    
          // Guardar información de fondo ocular
          pool.query( 
            `INSERT INTO fondo_ojo (expediente_id, od, oi) VALUES ($1, $2, $3)`,
            [expedienteId, fondoOjo.od, fondoOjo.oi]
          ),
    
          // Guardar motilidad ocular
          pool.query(
            `INSERT INTO motilidad_ocular (expediente_id, od, oi, ao) VALUES ($1, $2, $3, $4)`,
            [expedienteId, motilidadOcular.od, motilidadOcular.oi, motilidadOcular.ao]
          ),
    
          // Guardar presion intraocular
          pool.query(
            `INSERT INTO pio (expediente_id, od_pio, oi_pio) VALUES ($1, $2, $3)`,
            [expedienteId, pio.odPio, pio.oiPio]
          ),
    
          // Guardar diagnóstico
          pool.query(
            `INSERT INTO diagnostico (expediente_id, diagnostico, tipos_lentes, proxima_cita, observaciones)
             VALUES ($1, $2, $3, $4, $5)`,
            [expedienteId, diagnostico.diagnostico, diagnostico.tiposLentes, diagnostico.proximaCita, diagnostico.observaciones]
          ),
    
          // Guardar datos de montaje
          pool.query(
            `INSERT INTO datos_montaje (expediente_id, od_h, od_v, oi_h, oi_v) VALUES ($1, $2, $3, $4, $5)`,
            [expedienteId, datosMontaje.odH, datosMontaje.odV, datosMontaje.oiH, datosMontaje.oiV]
          ),
  
          // Guardar cover test
          pool.query(
              `INSERT INTO cover_test (expediente_id, od_vl, od_vp, oi_vl, oi_vp) VALUES ($1, $2, $3, $4, $5)`,
              [expedienteId, coverTest.odVl, coverTest.odVp, coverTest.oiVl, coverTest.oiVp]
          ),
  
          // Guardar queratometria
          pool.query(
              `INSERT INTO queratometria (expediente_id, od_keratometria, oi_keratometria) VALUES ($1, $2, $3)`,
              [expedienteId, queratometria.odKeratometria, queratometria.oiKeratometria]
          ),
  
          // Guardar observaciones
          pool.query(
              `INSERT INTO observaciones (expediente_id, observaciones) VALUES ($1, $2)`,
              [expedienteId, observaciones.observaciones]
          ),
        ];
    
        await Promise.all(promises);
    
        res.status(200).json({ message: 'Datos guardados exitosamente', expedienteId});
      } catch (error) {
        console.error('Error al guardar datos:', error);
        res.status(500).json({ error: 'Error al guardar los datos' });
      }
  };

module.exports = {
  saveFormData,saveFormDataCita
};
