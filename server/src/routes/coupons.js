const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.get('/', protect, authorize('admin', 'superadmin'), getCoupons);
router.post('/', protect, authorize('admin', 'superadmin'), createCoupon);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateCoupon);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteCoupon);

// Validate coupon — requires auth to check per-user usage
router.post('/validate', protect, validateCoupon);

module.exports = router;
