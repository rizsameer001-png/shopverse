const express = require('express');
const router = express.Router();
const { getPages, getPage, createPage, updatePage, deletePage } = require('../controllers/pageController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

router.get('/', getPages);
router.get('/:id', getPage);
router.post('/', protect, authorize('admin', 'superadmin'), uploadCategory, createPage);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadCategory, updatePage);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deletePage);
module.exports = router;
