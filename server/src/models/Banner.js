const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  image: { public_id: String, url: { type: String, default: '' } },
  mobileImage: { public_id: String, url: String },
  position: { type: String, enum: ['hero', 'promo', 'sidebar', 'popup'], default: 'hero' },
  bgColor: { type: String, default: '#fff7ed' },
  textColor: { type: String, default: '#1f2937' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
