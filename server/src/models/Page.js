const mongoose = require('mongoose');
const slugify = require('slugify');

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { public_id: String, url: { type: String, default: '' } },
  template: { type: String, enum: ['default', 'full-width', 'sidebar', 'landing'], default: 'default' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  isSystem: { type: Boolean, default: false }, // system pages can't be deleted
  sortOrder: { type: Number, default: 0 },
  showInNav: { type: Boolean, default: false },
  metaTitle: String,
  metaDescription: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

pageSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.isSystem) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Page', pageSchema);
