const asyncHandler = require('express-async-handler');
const Page = require('../models/Page');
const { cloudinary } = require('../config/cloudinary');

exports.getPages = asyncHandler(async (req, res) => {
  const { status, showInNav } = req.query;
  const query = {};
  if (!req.user || req.user.role === 'user') query.status = 'published';
  else if (status) query.status = status;
  if (showInNav === 'true') query.showInNav = true;
  const pages = await Page.find(query).populate('author', 'name').sort({ sortOrder: 1, title: 1 }).select('-content');
  res.json({ success: true, data: pages });
});

exports.getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] }).populate('author', 'name');
  if (!page) { res.status(404); throw new Error('Page not found'); }
  res.json({ success: true, data: page });
});

exports.createPage = asyncHandler(async (req, res) => {
  const { title, content, excerpt, template, status, showInNav, sortOrder, metaTitle, metaDescription, imageUrl } = req.body;
  const coverImage = {};
  if (req.file) { coverImage.public_id = req.file.filename; coverImage.url = req.file.path; }
  else if (imageUrl) {
    const r = await cloudinary.uploader.upload(imageUrl, { folder: 'shopverse/pages' });
    coverImage.public_id = r.public_id; coverImage.url = r.secure_url;
  }
  const page = await Page.create({ title, content, excerpt, template, status, showInNav, sortOrder, metaTitle, metaDescription, coverImage, author: req.user.id });
  res.status(201).json({ success: true, data: page });
});

exports.updatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) { res.status(404); throw new Error('Page not found'); }
  if (req.file) {
    if (page.coverImage?.public_id) await cloudinary.uploader.destroy(page.coverImage.public_id);
    page.coverImage = { public_id: req.file.filename, url: req.file.path };
  } else if (req.body.imageUrl) {
    if (page.coverImage?.public_id) await cloudinary.uploader.destroy(page.coverImage.public_id);
    const r = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'shopverse/pages' });
    page.coverImage = { public_id: r.public_id, url: r.secure_url };
  }
  const { title, content, excerpt, template, status, showInNav, sortOrder, metaTitle, metaDescription } = req.body;
  Object.assign(page, { title, content, excerpt, template, status, showInNav, sortOrder, metaTitle, metaDescription });
  await page.save();
  res.json({ success: true, data: page });
});

exports.deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) { res.status(404); throw new Error('Page not found'); }
  if (page.isSystem) { res.status(403); throw new Error('System pages cannot be deleted'); }
  if (page.coverImage?.public_id) await cloudinary.uploader.destroy(page.coverImage.public_id);
  await page.deleteOne();
  res.json({ success: true, message: 'Page deleted' });
});
