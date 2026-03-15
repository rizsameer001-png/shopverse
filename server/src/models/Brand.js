const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters'],
  },
  slug: { type: String, unique: true },
  description: String,
  logo: {
    public_id: String,
    url: { type: String, default: '' },
  },
  website: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

brandSchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  count: true,
});

module.exports = mongoose.model('Brand', brandSchema);
