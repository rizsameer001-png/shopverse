const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, monthOrders, lastMonthOrders,
    totalRevenue, monthRevenue,
    totalUsers, newUsers,
    totalProducts, lowStockProducts,
    pendingOrders, processingOrders,
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByMonth,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { isPaid: true, createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'processing' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5).select('name soldCount price images ratings'),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } },
    ]),
  ]);

  const totalRev = totalRevenue[0]?.total || 0;
  const monthRev = monthRevenue[0]?.total || 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalOrders,
        monthOrders,
        orderGrowth: lastMonthOrders > 0 ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 100,
        totalRevenue: totalRev,
        monthRevenue: monthRev,
        totalUsers,
        newUsers,
        totalProducts,
        lowStockProducts,
        pendingOrders,
        processingOrders,
      },
      recentOrders,
      topProducts,
      ordersByStatus,
      revenueByMonth,
    },
  });
});

exports.getRevenueChart = asyncHandler(async (req, res) => {
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;
  let data;

  if (period === 'daily') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    data = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  } else {
    data = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: new Date(Number(year), 0, 1), $lte: new Date(Number(year), 11, 31) } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } },
    ]);
  }

  res.json({ success: true, data });
});
