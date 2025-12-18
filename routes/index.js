var express = require('express');
var router = express.Router();

/* GET home page - redirigir al login */
router.get('/', function(req, res, next) {
  if (req.session && req.session.authenticated) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
