// users.js
const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'superadmin'), getUsers);
router.get('/:id', protect, authorize('admin', 'superadmin'), getUser);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateUser);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteUser);

router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
