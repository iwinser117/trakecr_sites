const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard principal
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const totalVisits = await Visit.countDocuments();
    const visits = await Visit.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalVisits / limit);

    res.render('dashboard', {
      title: 'Dashboard - Historial de Visitas',
      username: req.session.username,
      visits,
      currentPage: page,
      totalPages,
      totalVisits
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.status(500).render('error', { 
      message: 'Error al cargar el dashboard',
      error: error 
    });
  }
});

// Endpoint para eliminar una visita
router.post('/dashboard/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Visit.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al eliminar visita:', error);
    res.redirect('/dashboard');
  }
});

// Endpoint para limpiar todas las visitas
router.post('/dashboard/clear-all', isAuthenticated, async (req, res) => {
  try {
    await Visit.deleteMany({});
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al limpiar visitas:', error);
    res.redirect('/dashboard');
  }
});

// Endpoint para eliminar visitas filtradas
router.post('/dashboard/delete-filtered', isAuthenticated, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : (req.body.ids ? [req.body.ids] : []);
    if (ids.length > 0) {
      await Visit.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al eliminar visitas filtradas:', error);
    res.redirect('/dashboard');
  }
});

// Endpoint para eliminar visitas seleccionadas
router.post('/dashboard/delete-selected', isAuthenticated, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : (req.body.ids ? [req.body.ids] : []);
    if (ids.length > 0) {
      await Visit.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al eliminar visitas seleccionadas:', error);
    res.redirect('/dashboard');
  }
});

module.exports = router;
