const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

exports.getBanners = asyncHandler(async (req, res) => {
  const { position, isActive } = req.query;
  const query = {};
  if (position) query.position = position;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, data: banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, buttonLink, position, bgColor, textColor, isActive, sortOrder, startDate, endDate, imageUrl } = req.body;
  const image = {};
  if (req.file) { image.public_id = req.file.filename; image.url = req.file.path; }
  else if (imageUrl) {
    const r = await cloudinary.uploader.upload(imageUrl, { folder: 'shopverse/banners', transformation: [{ width: 1400, height: 500, crop: 'fill', quality: 'auto' }] });
    image.public_id = r.public_id; image.url = r.secure_url;
  }
  const banner = await Banner.create({ title, subtitle, buttonText, buttonLink, position, bgColor, textColor, isActive, sortOrder, startDate, endDate, image });
  res.status(201).json({ success: true, data: banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) { res.status(404); throw new Error('Banner not found'); }
  if (req.file) {
    if (banner.image?.public_id) await cloudinary.uploader.destroy(banner.image.public_id).catch(() => {});
    banner.image = { public_id: req.file.filename, url: req.file.path };
  } else if (req.body.imageUrl) {
    if (banner.image?.public_id) await cloudinary.uploader.destroy(banner.image.public_id).catch(() => {});
    const r = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'shopverse/banners' });
    banner.image = { public_id: r.public_id, url: r.secure_url };
  }
  Object.assign(banner, { ...req.body });
  await banner.save();
  res.json({ success: true, data: banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) { res.status(404); throw new Error('Banner not found'); }
  if (banner.image?.public_id) await cloudinary.uploader.destroy(banner.image.public_id).catch(() => {});
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});
