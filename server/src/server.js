// Load env vars
require('dotenv').config();
const express = require('express');
//const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');



// Connect to database
connectDB();

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.send('shopverse Ecommerce API Running 🚀');
});
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/subcategories', require('./routes/subcategories'));
app.use('/api/v1/brands', require('./routes/brands'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/wishlist', require('./routes/wishlist'));
app.use('/api/v1/cart', require('./routes/cart'));
app.use('/api/v1/reviews', require('./routes/reviews'));
app.use('/api/v1/coupons', require('./routes/coupons'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/blogs',    require('./routes/blogs'));
app.use('/api/v1/pages',    require('./routes/pages'));
app.use('/api/v1/banners',  require('./routes/banners'));
app.use('/api/v1/settings', require('./routes/settings'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,  "0.0.0.0", () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
