import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import SubCategoriesPage from './pages/SubCategoriesPage';
import BrandsPage from './pages/BrandsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import UsersPage from './pages/UsersPage';
import WishlistStatsPage from './pages/WishlistStatsPage';
import CouponsPage from './pages/CouponsPage';
import BlogsPage from './pages/BlogsPage';
import PagesPage from './pages/PagesPage';
import BannersPage from './pages/BannersPage';
import SettingsPage from './pages/SettingsPage';

function AdminRoute({ children }) {
  const { user, token } = useSelector(s => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin'].includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="products"          element={<ProductsPage />} />
          <Route path="products/new"      element={<ProductFormPage />} />
          <Route path="products/edit/:id" element={<ProductFormPage />} />
          <Route path="categories"        element={<CategoriesPage />} />
          <Route path="subcategories"     element={<SubCategoriesPage />} />
          <Route path="brands"            element={<BrandsPage />} />
          <Route path="orders"            element={<OrdersPage />} />
          <Route path="orders/:id"        element={<OrderDetailPage />} />
          <Route path="users"             element={<UsersPage />} />
          <Route path="wishlist-stats"    element={<WishlistStatsPage />} />
          <Route path="coupons"           element={<CouponsPage />} />
          <Route path="blogs"             element={<BlogsPage />} />
          <Route path="pages"             element={<PagesPage />} />
          <Route path="banners"           element={<BannersPage />} />
          <Route path="settings"          element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
