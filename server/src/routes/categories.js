const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin', 'superadmin'), uploadCategory, createCategory);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadCategory, updateCategory);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteCategory);

module.exports = router;
