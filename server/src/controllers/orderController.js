const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    couponCode, itemsPrice, shippingPrice, taxPrice, totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate stock and build items
  const itemsWithDetails = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    itemsWithDetails.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.discountedPrice || product.price,
      quantity: item.quantity,
      variant: item.variant,
    });
  }

  // Validate & apply coupon
  let discountAmount = 0;
  let couponId = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && new Date() <= coupon.validUntil) {
      couponId = coupon._id;
      if (coupon.type === 'percentage') {
        discountAmount = Math.min(
          (itemsPrice * coupon.value) / 100,
          coupon.maxDiscount || Infinity
        );
      } else {
        discountAmount = coupon.value;
      }
      coupon.usedCount += 1;
      coupon.usedBy.push(req.user.id);
      await coupon.save();
    }
  }

  const order = await Order.create({
    user: req.user.id,
    orderItems: itemsWithDetails,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    taxPrice: taxPrice || 0,
    discountAmount,
    totalPrice: totalPrice - discountAmount,
    coupon: couponId,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Decrease stock
  for (const item of itemsWithDetails) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  res.status(201).json({ success: true, data: populatedOrder });
});

// @desc    Get my orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments({ user: req.user.id });
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('orderItems.product', 'name images');

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / Number(limit)),
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Users can only see their own orders
  if (order.user._id.toString() !== req.user.id && req.user.role === 'user') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, data: order });
});

// @desc    Update order to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'confirmed';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.email_address,
  };
  order.statusHistory.push({ status: 'confirmed', note: 'Payment received' });

  const updated = await order.save();
  res.json({ success: true, data: updated });
});

// @desc    Request return
// @route   PUT /api/v1/orders/:id/return
// @access  Private
exports.requestReturn = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.orderStatus !== 'delivered') {
    res.status(400);
    throw new Error('Can only return delivered orders');
  }

  order.returnRequest = {
    isRequested: true,
    reason,
    requestedAt: Date.now(),
    status: 'pending',
  };
  order.statusHistory.push({ status: 'return_requested', note: reason });

  await order.save();
  res.json({ success: true, message: 'Return request submitted', data: order });
});

// ============ ADMIN CONTROLLERS ============

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders
// @access  Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};

  if (status) query.orderStatus = status;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / Number(limit)),
    data: orders,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, carrier } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  order.statusHistory.push({ status, note: note || '' });

  await order.save();
  res.json({ success: true, data: order });
});
