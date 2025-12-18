const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

// Endpoint para recibir visitas desde otras aplicaciones
router.post('/track', async (req, res) => {
  try {
    const { siteName, url, additionalData } = req.body;
    
    // Validar datos requeridos
    if (!siteName || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'siteName y url son requeridos' 
      });
    }

    // Crear nueva visita
    const visit = new Visit({
      siteName,
      url,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      referrer: req.headers['referer'] || req.headers['referrer'],
      additionalData: additionalData || {}
    });

    await visit.save();

    res.status(201).json({ 
      success: true, 
      message: 'Visita registrada correctamente',
      visitId: visit._id
    });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar la visita' 
    });
  }
});

// Endpoint para obtener estadísticas (opcional, protegido)
router.get('/stats', async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const visitsBySite = await Visit.aggregate([
      { $group: { _id: '$siteName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      totalVisits,
      visitsBySite
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
});

module.exports = router;
