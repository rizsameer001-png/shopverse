const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');
const { cloudinary } = require('../config/cloudinary');

exports.getBrands = asyncHandler(async (req, res) => {
  const { isActive, isFeatured } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  const brands = await Brand.find(query).populate('productsCount').sort({ name: 1 });
  res.json({ success: true, count: brands.length, data: brands });
});

exports.getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  res.json({ success: true, data: brand });
});

exports.createBrand = asyncHandler(async (req, res) => {
  const { name, description, website, isFeatured } = req.body;
  const logo = {};
  if (req.file) { logo.public_id = req.file.filename; logo.url = req.file.path; }
  else if (req.body.logoUrl) {
    const r = await cloudinary.uploader.upload(req.body.logoUrl, { folder: 'shopverse/brands' });
    logo.public_id = r.public_id; logo.url = r.secure_url;
  }
  const brand = await Brand.create({ name, description, logo, website, isFeatured });
  res.status(201).json({ success: true, data: brand });
});

exports.updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  if (req.file) {
    if (brand.logo?.public_id) await cloudinary.uploader.destroy(brand.logo.public_id);
    brand.logo = { public_id: req.file.filename, url: req.file.path };
  } else if (req.body.logoUrl) {
    if (brand.logo?.public_id) await cloudinary.uploader.destroy(brand.logo.public_id);
    const r = await cloudinary.uploader.upload(req.body.logoUrl, { folder: 'shopverse/brands' });
    brand.logo = { public_id: r.public_id, url: r.secure_url };
  }
  const { name, description, website, isActive, isFeatured } = req.body;
  Object.assign(brand, { name, description, website, isActive, isFeatured });
  await brand.save();
  res.json({ success: true, data: brand });
});

exports.deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  if (brand.logo?.public_id) await cloudinary.uploader.destroy(brand.logo.public_id);
  await brand.deleteOne();
  res.json({ success: true, message: 'Brand deleted' });
});
