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
  additionalData: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visit', visitSchema);
