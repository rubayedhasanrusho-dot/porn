const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  source: { type: String, required: true },
  thumbnail: String,
  description: String,
  duration: String,
  creator: String,
  creatorUrl: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  views: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ creator: 1 });

module.exports = mongoose.model('Video', videoSchema);
