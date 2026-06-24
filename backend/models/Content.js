const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  source: { type: String, required: true },
  thumbnail: String,
  description: String,
  type: { type: String, enum: ['video', 'article', 'image'], default: 'video' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);