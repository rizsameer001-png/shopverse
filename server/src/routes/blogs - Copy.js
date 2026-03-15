const express = require('express');
const router = express.Router();
const {
  getBlogs, getBlog, createBlog, updateBlog, deleteBlog,
  addComment, getBlogCategories, approveComment,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

// Optional auth - attach user if token present (for admin to see drafts)
const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

router.get('/categories', getBlogCategories);        // ← must be BEFORE /:id
router.get('/', optionalAuth, getBlogs);
router.get('/:id', optionalAuth, getBlog);

router.post('/',   protect, authorize('admin', 'superadmin'), uploadCategory, createBlog);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadCategory, updateBlog);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBlog);

router.post('/:id/comments', protect, addComment);
router.put('/:id/comments/:commentId/approve', protect, authorize('admin', 'superadmin'), approveComment);

module.exports = router;
