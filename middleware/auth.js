// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { isAuthenticated };
