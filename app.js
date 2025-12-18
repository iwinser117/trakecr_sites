require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
var dashboardRouter = require('./routes/dashboard');

var app = express();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker_sites')
.then(() => console.log('✓ Conectado a MongoDB'))
.catch(err => console.error('✗ Error al conectar a MongoDB:', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto_super_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // cambiar a true si usas HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/', authRouter);
app.use('/', dashboardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error del servidor';

  // Para 404, usar la página especial
  if (status === 404) {
    return res.status(404).render('404', { 
      url: req.url,
      message: 'Página no encontrada'
    });
  }

  // Para otros errores, usar la página de error general
  res.status(status);
  res.render('error', { 
    message: message,
    status: status,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
