const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'ShopVerse' },
  siteTagline: { type: String, default: 'Shop Everything' },
  logo: { public_id: String, url: String },
  favicon: { public_id: String, url: String },
  email: String,
  phone: String,
  address: String,
  socialLinks: {
    facebook:  { type: String, default: '' },
    twitter:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube:   { type: String, default: '' },
  },
  currencies: [{
    code:   { type: String, required: true },  // USD, EUR, GBP, INR
    symbol: { type: String, required: true },  // $, €, £, ₹
    name:   { type: String, required: true },  // US Dollar
    rate:   { type: Number, default: 1 },       // exchange rate vs USD
    isDefault: { type: Boolean, default: false },
  }],
  languages: [{
    code:  { type: String, required: true },   // en, fr, de, ar
    name:  { type: String, required: true },   // English, French
    dir:   { type: String, enum: ['ltr', 'rtl'], default: 'ltr' },
    isDefault: { type: Boolean, default: false },
  }],
  defaultCurrency: { type: String, default: 'USD' },
  defaultLanguage: { type: String, default: 'en' },
  metaTitle:       String,
  metaDescription: String,
  googleAnalyticsId: String,
  freeShippingThreshold: { type: Number, default: 50 },
  taxRate:          { type: Number, default: 10 },
  maintenance:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
