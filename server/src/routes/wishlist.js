const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, clearWishlist, getWishlistStats } = require('../controllers/wishlistController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/toggle/:productId', protect, toggleWishlist);
router.delete('/', protect, clearWishlist);
router.get('/admin/stats', protect, authorize('admin', 'superadmin'), getWishlistStats);

module.exports = router;
