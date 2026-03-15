const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: { type: String, unique: true },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  shortDescription: { type: String, maxlength: 500 },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  barcode: String,
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  }],
  variants: [{
    name: String,       // e.g., "Color", "Size"
    options: [String],  // e.g., ["Red","Blue"], ["S","M","L"]
  }],
  specifications: [{
    key: String,
    value: String,
  }],
  tags: [{ type: String, trim: true, lowercase: true }],
  reviews: [reviewSchema],
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'express', 'free'],
    default: 'standard',
  },
  metaTitle: String,
  metaDescription: String,
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Calculate average ratings
productSchema.methods.calcRatings = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Virtual: discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
  }
  return this.price;
});

// Virtual: in stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Indexes for search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

module.exports = mongoose.model('Product', productSchema);
