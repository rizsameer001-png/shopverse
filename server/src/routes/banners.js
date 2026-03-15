const express = require('express');
const router = express.Router();
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

router.get('/', getBanners);
router.post('/',      protect, authorize('admin', 'superadmin'), uploadCategory, createBanner);
router.put('/:id',    protect, authorize('admin', 'superadmin'), uploadCategory, updateBanner);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBanner);
module.exports = router;
