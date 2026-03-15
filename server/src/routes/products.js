const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, createReview, setDefaultImage,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../config/cloudinary');

// Optional auth middleware — attaches req.user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

router.get('/',    optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

router.post('/',            protect, authorize('admin', 'superadmin'), uploadProduct, createProduct);
router.put('/:id',          protect, authorize('admin', 'superadmin'), uploadProduct, updateProduct);
router.delete('/:id',       protect, authorize('admin', 'superadmin'), deleteProduct);
router.post('/:id/reviews', protect, createReview);
router.put('/:id/default-image/:imageId', protect, authorize('admin', 'superadmin'), setDefaultImage);

module.exports = router;
