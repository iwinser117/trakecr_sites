const express = require('express');
const router = express.Router();

// Página de login
router.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login - Tracker Sites', error: null });
});

// Procesar login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validar contra variables de entorno
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.username = username;
    res.redirect('/dashboard');
  } else {
    res.render('login', { 
      title: 'Login - Tracker Sites', 
      error: 'Usuario o contraseña incorrectos' 
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
