// subcategories.js
const express = require('express');
const router = express.Router();
const { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

router.get('/', getSubCategories);
router.post('/', protect, authorize('admin', 'superadmin'), uploadCategory, createSubCategory);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadCategory, updateSubCategory);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteSubCategory);

module.exports = router;
