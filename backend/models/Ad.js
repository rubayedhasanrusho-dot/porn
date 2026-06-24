const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, enum: ['pop', 'popunder', 'banner_top', 'banner_sidebar', 'banner_between'], required: true },
  code: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ad', adSchema);
