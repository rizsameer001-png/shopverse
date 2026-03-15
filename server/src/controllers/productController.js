const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// Helper: find product safely by id OR slug
async function findProduct(identifier) {
  // Try as ObjectId first; fall back to slug search
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  if (isObjectId) {
    const byId = await Product.findById(identifier)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name logo website')
      .populate('reviews.user', 'name avatar');
    if (byId) return byId;
  }
  // Search by slug
  return Product.findOne({ slug: identifier })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('brand', 'name logo website')
    .populate('reviews.user', 'name avatar');
}

// @desc    Get all products with filters, search, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    keyword, category, subcategory, brand, minPrice, maxPrice,
    minRating, sort, page = 1, limit = 12, isFeatured,
    isNewArrival, isBestSeller, isActive,
  } = req.query;

  const query = {};

  // Public only sees active products; admins can filter
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
  if (!isAdmin) {
    query.isActive = true;
  } else if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
    ];
  }
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (brand) query.brand = brand;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (minRating) query.ratings = { $gte: Number(minRating) };
  if (isFeatured === 'true') query.isFeatured = true;
  if (isNewArrival === 'true') query.isNewArrival = true;
  if (isBestSeller === 'true') query.isBestSeller = true;

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  if (sort === 'price-desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { ratings: -1 };
  if (sort === 'popular') sortOption = { soldCount: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name logo')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: products.length,
    data: products,
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await findProduct(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  // Increment view count (fire and forget)
  Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();
  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/v1/products
// @access  Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, shortDescription, price, comparePrice, costPrice,
    sku, barcode, stock, lowStockThreshold, category, subcategory, brand,
    variants, specifications, tags, isFeatured, isNewArrival, isBestSeller,
    discount, weight, shippingClass, metaTitle, metaDescription,
    imageUrls,
  } = req.body;

  const images = [];

  // From uploaded files
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, i) => {
      images.push({
        public_id: file.filename,
        url: file.path,
        isDefault: i === 0,
      });
    });
  }

  // From online URL(s)
  if (imageUrls) {
    const urls = Array.isArray(imageUrls)
      ? imageUrls
      : (() => { try { return JSON.parse(imageUrls); } catch { return [imageUrls]; } })();

    for (const url of urls) {
      if (url && url.trim().startsWith('http')) {
        try {
          const result = await cloudinary.uploader.upload(url.trim(), {
            folder: 'shopverse/products',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
          });
          images.push({
            public_id: result.public_id,
            url: result.secure_url,
            isDefault: images.length === 0,
          });
        } catch (err) {
          console.error('URL image upload error:', err.message);
        }
      }
    }
  }

  const parseField = (field) => {
    if (!field) return undefined;
    if (typeof field === 'string') { try { return JSON.parse(field); } catch { return field; } }
    return field;
  };

  const product = await Product.create({
    name,
    description,
    shortDescription,
    price: Number(price),
    comparePrice: comparePrice ? Number(comparePrice) : undefined,
    costPrice: costPrice ? Number(costPrice) : undefined,
    sku: sku || undefined,
    barcode: barcode || undefined,
    stock: Number(stock) || 0,
    lowStockThreshold: Number(lowStockThreshold) || 5,
    category,
    subcategory: subcategory || undefined,
    brand: brand || undefined,
    variants: parseField(variants) || [],
    specifications: parseField(specifications) || [],
    tags: parseField(tags) || [],
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isNewArrival: isNewArrival === 'true' || isNewArrival === true,
    isBestSeller: isBestSeller === 'true' || isBestSeller === true,
    isActive: true,
    discount: Number(discount) || 0,
    weight: weight ? Number(weight) : undefined,
    shippingClass: shippingClass || 'standard',
    metaTitle,
    metaDescription,
    images,
  });

  const populated = await Product.findById(product._id)
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const { removeImages, imageUrls, variants, specifications, tags, isFeatured, isNewArrival, isBestSeller, isActive, ...rest } = req.body;

  const parseField = (field, fallback) => {
    if (!field) return fallback;
    if (typeof field === 'string') { try { return JSON.parse(field); } catch { return fallback; } }
    return field;
  };

  // Remove specified images from Cloudinary
  if (removeImages) {
    const toRemove = parseField(removeImages, []);
    for (const publicId of toRemove) {
      try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.error('destroy error:', e.message); }
    }
    product.images = product.images.filter(img => !toRemove.includes(img.public_id));
  }

  // Add new uploaded files
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      product.images.push({ public_id: file.filename, url: file.path, isDefault: false });
    });
  }

  // Add new URL images
  if (imageUrls) {
    const urls = parseField(imageUrls, []);
    const urlArray = Array.isArray(urls) ? urls : [urls];
    for (const url of urlArray) {
      if (url && url.trim().startsWith('http')) {
        try {
          const result = await cloudinary.uploader.upload(url.trim(), { folder: 'shopverse/products' });
          product.images.push({ public_id: result.public_id, url: result.secure_url, isDefault: false });
        } catch (err) { console.error('URL upload error:', err.message); }
      }
    }
  }

  // Ensure a default image exists
  if (product.images.length > 0 && !product.images.some(i => i.isDefault)) {
    product.images[0].isDefault = true;
  }

  // Apply scalar fields
  const numericFields = ['price', 'comparePrice', 'costPrice', 'stock', 'lowStockThreshold', 'discount', 'weight'];
  for (const [key, val] of Object.entries(rest)) {
    if (val === '' || val === undefined) continue;
    product[key] = numericFields.includes(key) ? Number(val) : val;
  }

  // Boolean flags
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (isNewArrival !== undefined) product.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
  if (isBestSeller !== undefined) product.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
  if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

  // Array fields
  if (variants !== undefined) product.variants = parseField(variants, product.variants);
  if (specifications !== undefined) product.specifications = parseField(specifications, product.specifications);
  if (tags !== undefined) product.tags = parseField(tags, product.tags);

  await product.save();

  const updated = await Product.findById(product._id)
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  res.json({ success: true, data: updated });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  for (const img of product.images) {
    if (img.public_id) {
      try { await cloudinary.uploader.destroy(img.public_id); } catch (e) { console.error(e.message); }
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Create or update product review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) { res.status(400); throw new Error('Rating and comment are required'); }

  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user.id.toString()
  );
  if (alreadyReviewed) { res.status(400); throw new Error('You have already reviewed this product'); }

  product.reviews.push({
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment: comment.trim(),
  });

  product.calcRatings();
  await product.save();

  res.status(201).json({ success: true, message: 'Review submitted successfully' });
});

// @desc    Set default product image
// @route   PUT /api/v1/products/:id/default-image/:imageId
// @access  Admin
exports.setDefaultImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  product.images = product.images.map(img => ({
    ...img.toObject(),
    isDefault: img._id.toString() === req.params.imageId,
  }));

  await product.save();
  res.json({ success: true, data: product });
});
