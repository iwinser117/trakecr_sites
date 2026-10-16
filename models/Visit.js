const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  // Identificadores anonimizados para agrupar visitas del mismo navegador.
  visitorKey: {
    type: String,
    index: true
  },
  sessionId: String,
  additionalData: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

visitSchema.index({ siteName: 1, url: 1, visitorKey: 1, timestamp: -1 });

module.exports = mongoose.model('Visit', visitSchema);
