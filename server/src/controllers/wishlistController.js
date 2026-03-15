const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('products.product', 'name price comparePrice discount images ratings isActive stock');

  if (!wishlist) {
    return res.json({ success: true, data: { products: [] } });
  }
  res.json({ success: true, data: wishlist });
});

// @desc    Toggle product in wishlist
// @route   POST /api/v1/wishlist/toggle/:productId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [{ product: productId }] });
    return res.json({ success: true, added: true, message: 'Added to wishlist' });
  }

  const existingIndex = wishlist.products.findIndex(
    p => p.product.toString() === productId
  );

  if (existingIndex > -1) {
    wishlist.products.splice(existingIndex, 1);
    await wishlist.save();
    return res.json({ success: true, added: false, message: 'Removed from wishlist' });
  } else {
    wishlist.products.push({ product: productId });
    await wishlist.save();
    return res.json({ success: true, added: true, message: 'Added to wishlist' });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/v1/wishlist
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndUpdate({ user: req.user.id }, { products: [] });
  res.json({ success: true, message: 'Wishlist cleared' });
});

// ============ ADMIN ============

// @desc    Get all wishlists with product counts (admin)
// @route   GET /api/v1/wishlist/admin/stats
// @access  Admin
exports.getWishlistStats = asyncHandler(async (req, res) => {
  // Aggregate: most wishlisted products
  const productStats = await Wishlist.aggregate([
    { $unwind: '$products' },
    { $group: { _id: '$products.product', totalWishlists: { $sum: 1 } } },
    { $sort: { totalWishlists: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        _id: 1,
        totalWishlists: 1,
        name: '$productInfo.name',
        price: '$productInfo.price',
        image: { $arrayElemAt: ['$productInfo.images', 0] },
      },
    },
  ]);

  // All user wishlists
  const userWishlists = await Wishlist.find()
    .populate('user', 'name email avatar')
    .populate('products.product', 'name price images')
    .select('-__v');

  res.json({
    success: true,
    data: {
      topWishlistedProducts: productStats,
      userWishlists,
      totalUsers: userWishlists.length,
    },
  });
});
