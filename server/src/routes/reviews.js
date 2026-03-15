// reviews.js
const express = require('express');
const r = express.Router();
r.get('/', (req, res) => res.json({ success: true, message: 'Use /products/:id/reviews' }));
module.exports = r;
