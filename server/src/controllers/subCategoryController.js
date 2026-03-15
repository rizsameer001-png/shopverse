const asyncHandler = require('express-async-handler');
const SubCategory = require('../models/SubCategory');
const { cloudinary } = require('../config/cloudinary');

exports.getSubCategories = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
  const subs = await SubCategory.find(query).populate('category', 'name slug').sort({ name: 1 });
  res.json({ success: true, count: subs.length, data: subs });
});

exports.createSubCategory = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;
  const image = {};
  if (req.file) { image.public_id = req.file.filename; image.url = req.file.path; }
  const sub = await SubCategory.create({ name, category, description, image });
  res.status(201).json({ success: true, data: sub });
});

exports.updateSubCategory = asyncHandler(async (req, res) => {
  const sub = await SubCategory.findById(req.params.id);
  if (!sub) { res.status(404); throw new Error('SubCategory not found'); }
  if (req.file) {
    if (sub.image?.public_id) await cloudinary.uploader.destroy(sub.image.public_id);
    sub.image = { public_id: req.file.filename, url: req.file.path };
  }
  Object.assign(sub, req.body);
  await sub.save();
  res.json({ success: true, data: sub });
});

exports.deleteSubCategory = asyncHandler(async (req, res) => {
  const sub = await SubCategory.findById(req.params.id);
  if (!sub) { res.status(404); throw new Error('SubCategory not found'); }
  if (sub.image?.public_id) await cloudinary.uploader.destroy(sub.image.public_id);
  await sub.deleteOne();
  res.json({ success: true, message: 'SubCategory deleted' });
});
