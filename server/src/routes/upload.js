const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const { cloudinary, uploadProduct } = require('../config/cloudinary');

// @desc  Upload images (multiple) to Cloudinary
// @route POST /api/v1/upload/images
// @access Admin
router.post('/images', protect, authorize('admin', 'superadmin'), uploadProduct, asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400); throw new Error('No files uploaded');
  }
  const images = req.files.map(f => ({ public_id: f.filename, url: f.path }));
  res.json({ success: true, data: images });
}));

// @desc  Upload image from URL
// @route POST /api/v1/upload/url
// @access Admin
router.post('/url', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const { url, folder = 'shopverse/products' } = req.body;
  if (!url) { res.status(400); throw new Error('URL is required'); }
  const result = await cloudinary.uploader.upload(url, {
    folder,
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  });
  res.json({ success: true, data: { public_id: result.public_id, url: result.secure_url } });
}));

// @desc  Delete image from Cloudinary
// @route DELETE /api/v1/upload/:publicId
// @access Admin
router.delete('/:publicId(*)', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ success: true, message: 'Image deleted' });
}));

module.exports = router;
