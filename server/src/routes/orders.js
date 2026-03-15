const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, updateOrderToPaid, requestReturn, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'superadmin'), getAllOrders);
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/return', protect, requestReturn);
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateOrderStatus);

module.exports = router;
