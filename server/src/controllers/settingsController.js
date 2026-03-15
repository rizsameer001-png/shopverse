const asyncHandler = require('express-async-handler');
const SiteSettings = require('../models/SiteSettings');
const { cloudinary } = require('../config/cloudinary');

const DEFAULT_SETTINGS = {
  siteName: 'ShopVerse', siteTagline: 'Shop Everything',
  defaultCurrency: 'USD', defaultLanguage: 'en',
  freeShippingThreshold: 50, taxRate: 10,
  currencies: [
    { code: 'USD', symbol: '$', name: 'US Dollar',   rate: 1,      isDefault: true  },
    { code: 'EUR', symbol: '€', name: 'Euro',         rate: 0.92,   isDefault: false },
    { code: 'GBP', symbol: '£', name: 'British Pound',rate: 0.79,   isDefault: false },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5,   isDefault: false },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67,   isDefault: false },
  ],
  languages: [
    { code: 'en', name: 'English', dir: 'ltr', isDefault: true  },
    { code: 'fr', name: 'Français', dir: 'ltr', isDefault: false },
    { code: 'de', name: 'Deutsch',  dir: 'ltr', isDefault: false },
    { code: 'ar', name: 'العربية', dir: 'rtl', isDefault: false },
    { code: 'es', name: 'Español',  dir: 'ltr', isDefault: false },
  ],
};

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create(DEFAULT_SETTINGS);
  res.json({ success: true, data: settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = new SiteSettings(DEFAULT_SETTINGS);
  const { logoUrl, faviconUrl, ...rest } = req.body;

  // Handle logo file
  if (req.files?.logo?.[0]) {
    if (settings.logo?.public_id) await cloudinary.uploader.destroy(settings.logo.public_id).catch(() => {});
    settings.logo = { public_id: req.files.logo[0].filename, url: req.files.logo[0].path };
  } else if (logoUrl) {
    if (settings.logo?.public_id) await cloudinary.uploader.destroy(settings.logo.public_id).catch(() => {});
    const r = await cloudinary.uploader.upload(logoUrl, { folder: 'shopverse/site', transformation: [{ width: 300, height: 80, crop: 'fit', quality: 'auto' }] });
    settings.logo = { public_id: r.public_id, url: r.secure_url };
  }

  // Handle favicon file
  if (req.files?.favicon?.[0]) {
    if (settings.favicon?.public_id) await cloudinary.uploader.destroy(settings.favicon.public_id).catch(() => {});
    settings.favicon = { public_id: req.files.favicon[0].filename, url: req.files.favicon[0].path };
  } else if (faviconUrl) {
    const r = await cloudinary.uploader.upload(faviconUrl, { folder: 'shopverse/site' });
    settings.favicon = { public_id: r.public_id, url: r.secure_url };
  }

  // Parse JSON fields if sent as strings
  ['currencies', 'languages', 'socialLinks'].forEach(field => {
    if (rest[field] && typeof rest[field] === 'string') {
      try { rest[field] = JSON.parse(rest[field]); } catch (_) {}
    }
  });

  Object.assign(settings, rest);
  await settings.save();
  res.json({ success: true, data: settings });
});
