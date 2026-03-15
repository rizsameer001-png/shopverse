const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

exports.getCategories = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const categories = await Category.find(query)
    .populate('subcategoriesCount')
    .populate('productsCount')
    .sort({ sortOrder: 1, name: 1 });

  res.json({ success: true, count: categories.length, data: categories });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, data: category });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, sortOrder, metaTitle, metaDescription } = req.body;
  const image = {};
  if (req.file) {
    image.public_id = req.file.filename;
    image.url = req.file.path;
  } else if (req.body.imageUrl) {
    const result = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'shopverse/categories' });
    image.public_id = result.public_id;
    image.url = result.secure_url;
  }
  const category = await Category.create({ name, description, image, sortOrder, metaTitle, metaDescription });
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }

  if (req.file) {
    if (category.image?.public_id) await cloudinary.uploader.destroy(category.image.public_id);
    category.image = { public_id: req.file.filename, url: req.file.path };
  } else if (req.body.imageUrl) {
    if (category.image?.public_id) await cloudinary.uploader.destroy(category.image.public_id);
    const result = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'shopverse/categories' });
    category.image = { public_id: result.public_id, url: result.secure_url };
  }

  const { name, description, isActive, sortOrder, metaTitle, metaDescription } = req.body;
  Object.assign(category, { name, description, isActive, sortOrder, metaTitle, metaDescription });
  await category.save();
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  if (category.image?.public_id) await cloudinary.uploader.destroy(category.image.public_id);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
