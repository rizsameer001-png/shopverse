const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary: cv } = require('../config/cloudinary');

const logoStorage = new CloudinaryStorage({ cloudinary: cv, params: { folder: 'shopverse/site', allowed_formats: ['jpg','jpeg','png','webp','svg'] } });
const upload = multer({ storage: logoStorage }).fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]);

router.get('/', getSettings);
router.put('/', protect, authorize('admin', 'superadmin'), upload, updateSettings);
module.exports = router;
