const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  lastScraped: Date,
}, { timestamps: true });

module.exports = mongoose.model('Source', sourceSchema);
