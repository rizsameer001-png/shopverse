const express = require('express');
const router = express.Router();
// Cart is managed client-side via Redux; this route is a placeholder
router.get('/', (req, res) => res.json({ success: true, message: 'Cart managed client-side' }));
module.exports = router;
