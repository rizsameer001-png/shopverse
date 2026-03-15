const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueChart } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'superadmin'), getDashboardStats);
router.get('/revenue', protect, authorize('admin', 'superadmin'), getRevenueChart);

module.exports = router;
