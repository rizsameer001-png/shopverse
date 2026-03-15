const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// Safe lookup by ObjectId OR slug
async function findBlog(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Blog.findById(identifier)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    if (byId) return byId;
  }
  return Blog.findOne({ slug: identifier })
    .populate('author', 'name avatar')
    .populate('comments.user', 'name avatar');
}

exports.getBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, status, category, keyword, isFeatured } = req.query;
  const query = {};
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
  if (!isAdmin) query.status = 'published';
  else if (status && status !== 'all') query.status = status;
  if (category) query.category = category;
  if (keyword) query.$or = [
    { title: { $regex: keyword, $options: 'i' } },
    { excerpt: { $regex: keyword, $options: 'i' } },
    { tags: { $in: [new RegExp(keyword, 'i')] } },
  ];
  if (isFeatured === 'true') query.isFeatured = true;

  const skip = (Number(page) - 1) * Number(limit);
  const [total, blogs] = await Promise.all([
    Blog.countDocuments(query),
    Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content -comments'),
  ]);

  res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), data: blogs });
});

exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await findBlog(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog post not found'); }
  // Only published posts visible to non-admins
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
  if (blog.status !== 'published' && !isAdmin) {
    res.status(404); throw new Error('Blog post not found');
  }
  Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();
  res.json({ success: true, data: blog });
});

exports.createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status, isFeatured, metaTitle, metaDescription, imageUrl } = req.body;
  const coverImage = {};
  if (req.file) { coverImage.public_id = req.file.filename; coverImage.url = req.file.path; }
  else if (imageUrl) {
    const r = await cloudinary.uploader.upload(imageUrl, { folder: 'shopverse/blogs' });
    coverImage.public_id = r.public_id; coverImage.url = r.secure_url;
  }
  const blog = await Blog.create({
    title, content, excerpt, category: category || 'General', status: status || 'draft',
    isFeatured: isFeatured === 'true' || isFeatured === true,
    metaTitle, metaDescription, coverImage, author: req.user.id,
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
  });
  res.status(201).json({ success: true, data: blog });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const blog = await findBlog(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  if (req.file) {
    if (blog.coverImage?.public_id) await cloudinary.uploader.destroy(blog.coverImage.public_id).catch(() => {});
    blog.coverImage = { public_id: req.file.filename, url: req.file.path };
  } else if (req.body.imageUrl) {
    if (blog.coverImage?.public_id) await cloudinary.uploader.destroy(blog.coverImage.public_id).catch(() => {});
    const r = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'shopverse/blogs' });
    blog.coverImage = { public_id: r.public_id, url: r.secure_url };
  }
  const { title, content, excerpt, category, tags, status, isFeatured, metaTitle, metaDescription } = req.body;
  Object.assign(blog, {
    title, content, excerpt, metaTitle, metaDescription,
    category: category || blog.category,
    status: status || blog.status,
    isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : blog.isFeatured,
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : blog.tags,
  });
  await blog.save();
  res.json({ success: true, data: blog });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await findBlog(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  if (blog.coverImage?.public_id) await cloudinary.uploader.destroy(blog.coverImage.public_id).catch(() => {});
  await blog.deleteOne();
  res.json({ success: true, message: 'Blog deleted' });
});

exports.addComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const blog = await findBlog(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  if (!comment?.trim()) { res.status(400); throw new Error('Comment cannot be empty'); }
  blog.comments.push({
    user: req.user?.id,
    name: req.user?.name || req.body.name || 'Anonymous',
    email: req.user?.email || req.body.email || '',
    comment: comment.trim(),
    isApproved: false,
  });
  await blog.save();
  res.status(201).json({ success: true, message: 'Comment submitted for review' });
});

exports.getBlogCategories = asyncHandler(async (req, res) => {
  const cats = await Blog.distinct('category', { status: 'published' });
  res.json({ success: true, data: cats.filter(Boolean) });
});

exports.approveComment = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  const comment = blog.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  comment.isApproved = true;
  await blog.save();
  res.json({ success: true, message: 'Comment approved' });
});
