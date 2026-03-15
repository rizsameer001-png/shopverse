const express = require('express');
const router = express.Router();
const { getBrands, getBrand, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBrand } = require('../config/cloudinary');

router.get('/', getBrands);
router.get('/:id', getBrand);
router.post('/', protect, authorize('admin', 'superadmin'), uploadBrand, createBrand);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadBrand, updateBrand);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBrand);

module.exports = router;
