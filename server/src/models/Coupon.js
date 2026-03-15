const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: 0,
  },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // for percentage coupons
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 }, // per user
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
