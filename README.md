# 🛍️ ShopVerse — Full-Stack E-Commerce Platform

A production-ready, full-stack e-commerce platform with:
- **Client** — React + Vite + Tailwind + Redux Toolkit
- **Admin Dashboard** — React + Vite + Tailwind + Chart.js
- **Server API** — Node.js + Express + MongoDB + Cloudinary

---
//install
npm install cookie-parser
Then Add This To Your Server

Right after imports:

const cookieParser = require('cookie-parser');

## 📁 Project Structure
```
ecommerce/
├── server/          # Express REST API
├── client/          # Customer-facing store
└── admin/           # Admin dashboard
```

---

## 🚀 Quick Start (Local)

### 1. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env.local
npm run dev
```

### 3. Admin Setup
```bash
cd admin
npm install
# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env.local
echo "VITE_CLIENT_URL=http://localhost:5173" >> .env.local
npm run dev
```

---

## ☁️ Deploy on Render

### Server (Web Service)
1. Push `server/` to GitHub
2. New → Web Service → Connect repo
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add all env vars from `.env.example`

### Client & Admin (Static Sites)
1. Push `client/` and `admin/` to GitHub
2. New → Static Site → Connect repo
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. Set `VITE_API_URL` to your Render API URL

---

## 🔑 Required Environment Variables (Server)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Min 32-char random string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `CLIENT_URL` | Frontend URL (for CORS) |
| `ADMIN_URL` | Admin URL (for CORS) |

---

## 📱 Flutter API Integration

The REST API is fully compatible with Flutter. Base URL format:
```
https://your-api.onrender.com/api/v1
```

### Key Endpoints for Flutter:
```
POST   /auth/register          Register user
POST   /auth/login             Login → returns JWT token
GET    /products               List products (with filters)
GET    /products/:id           Single product
POST   /orders                 Create order
GET    /orders/my-orders       User's orders
POST   /wishlist/toggle/:id    Toggle wishlist item
GET    /wishlist               Get user wishlist
```

### Auth Header (Flutter):
```dart
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

---

## ✨ Features

### Customer Store
- 🏠 Home with hero carousel, featured products, categories
- 🛒 Shopping cart with drawer (Redux persisted)
- ❤️ Wishlist with add/remove
- 🔍 Product search + filters (category, brand, price, rating)
- 🔎 Product detail with image zoom + magnify
- 📦 Order tracking with status timeline
- ↩️ Return request flow
- 👤 Profile management + multiple addresses
- 🔐 Auth: register, login, forgot/reset password
- 🎫 Coupon code support at checkout

### Admin Dashboard
- 📊 Dashboard with revenue charts (Line, Bar, Doughnut)
- 📦 Products CRUD + multi-image upload (file + URL)
- 🏷️ Categories with image upload
- 🔖 Sub-Categories management
- ⭐ Brands management with logo upload
- 🛒 Orders management + status updates + tracking
- 👥 Customer management
- ❤️ Wishlist stats — product name + total wishlist counts
- 🎫 Coupon CRUD

### API
- JWT Authentication with role-based access
- Cloudinary image storage & transformation
- Rate limiting, CORS, Helmet security
- Full CRUD for all resources
- Pagination, filtering, sorting
- Email support via Nodemailer
