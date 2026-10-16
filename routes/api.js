const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Visit = require('../models/Visit');

const configuredDeduplicationMinutes = Number.parseInt(
  process.env.TRACKER_DEDUP_MINUTES || '30',
  10
);
const DEDUPLICATION_MINUTES = Number.isNaN(configuredDeduplicationMinutes)
  ? 30
  : Math.max(0, configuredDeduplicationMinutes);
const VISITOR_COOKIE = 'tracker_visitor_id';
const SESSION_COOKIE = 'tracker_session_id';

function getOrCreateCookie(req, res, name, maxAge) {
  const currentValue = req.cookies && req.cookies[name];
  const value = currentValue || crypto.randomUUID();

  if (!currentValue) {
    res.cookie(name, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge
    });
  }

  return value;
}

function getVisitorKey(req, visitorId) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const source = visitorId || `${ip}|${userAgent}`;
  const secret = process.env.SESSION_SECRET || 'tracker-sites-visitor-key';

  return crypto.createHmac('sha256', secret).update(source).digest('hex');
}

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

    const deduplicationWindowMs = DEDUPLICATION_MINUTES * 60 * 1000;
    const visitorId = getOrCreateCookie(
      req,
      res,
      VISITOR_COOKIE,
      365 * 24 * 60 * 60 * 1000
    );
    const sessionId = getOrCreateCookie(
      req,
      res,
      SESSION_COOKIE,
      Math.max(deduplicationWindowMs, 60 * 1000)
    );
    // Si las cookies cross-origin están bloqueadas, usa el respaldo estable.
    const visitorKey = getVisitorKey(req, req.cookies && req.cookies[VISITOR_COOKIE]);

    if (deduplicationWindowMs > 0) {
      const recentVisit = await Visit.findOne({
        siteName,
        url,
        visitorKey,
        timestamp: { $gte: new Date(Date.now() - deduplicationWindowMs) }
      }).sort({ timestamp: -1 });

      if (recentVisit) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: 'Visita ya registrada dentro de la ventana configurada',
          visitId: recentVisit._id,
          sessionId
        });
      }
    }

    const visit = new Visit({
      siteName,
      url,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      referrer: req.headers['referer'] || req.headers['referrer'],
      visitorKey,
      sessionId,
      additionalData: additionalData || {}
    });

    await visit.save();

    res.status(201).json({ 
      success: true, 
      message: 'Visita registrada correctamente',
      visitId: visit._id,
      duplicate: false,
      sessionId
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
