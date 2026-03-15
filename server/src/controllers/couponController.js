const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  // Ensure code is uppercase
  if (req.body.code) req.body.code = req.body.code.toUpperCase().trim();
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  if (req.body.code) req.body.code = req.body.code.toUpperCase().trim();
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) { res.status(400); throw new Error('Coupon code is required'); }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (!coupon.isActive) { res.status(400); throw new Error('This coupon is no longer active'); }
  if (new Date() < new Date(coupon.validFrom)) { res.status(400); throw new Error('Coupon is not valid yet'); }
  if (new Date() > new Date(coupon.validUntil)) { res.status(400); throw new Error('This coupon has expired'); }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400); throw new Error('Coupon usage limit has been reached');
  }
  if (Number(orderAmount) < coupon.minOrderAmount) {
    res.status(400); throw new Error(`Minimum order amount for this coupon is $${coupon.minOrderAmount}`);
  }

  // Check per-user limit
  if (req.user) {
    const userUsage = coupon.usedBy.filter(uid => uid.toString() === req.user.id.toString()).length;
    if (userUsage >= (coupon.userLimit || 1)) {
      res.status(400); throw new Error('You have already used this coupon the maximum number of times');
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (Number(orderAmount) * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, Number(orderAmount));

  res.json({
    success: true,
    data: {
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount: +discount.toFixed(2),
      message: `Coupon applied! You save $${discount.toFixed(2)}`,
    }
  });
});
