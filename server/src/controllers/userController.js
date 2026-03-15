const asyncHandler = require('express-async-handler');
const User = require('../models/User');

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) query.role = role;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), data: users });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, email, role, isActive }, { new: true, runValidators: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { label, street, city, state, country, zipCode, isDefault } = req.body;
  if (isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push({ label, street, city, state, country, zipCode, isDefault });
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) { res.status(404); throw new Error('Address not found'); }
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});
