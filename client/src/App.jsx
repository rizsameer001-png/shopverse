import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { fetchCategories, fetchBrands } from './store/slices/productSlice';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage          from './pages/HomePage';
import ShopPage          from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrderSuccessPage  from './pages/OrderSuccessPage';
import WishlistPage      from './pages/WishlistPage';
import LoginPage         from './pages/auth/LoginPage';
import RegisterPage      from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { BlogListPage, BlogDetailPage } from './pages/BlogPage';
import DynamicPage       from './pages/DynamicPage';

import ProfileLayout   from './pages/profile/ProfileLayout';
import ProfilePage     from './pages/profile/ProfilePage';
import OrdersPage      from './pages/profile/OrdersPage';
import OrderDetailPage from './pages/profile/OrderDetailPage';
import ReturnPage      from './pages/profile/ReturnPage';
import AddressesPage   from './pages/profile/AddressesPage';
import SecurityPage    from './pages/profile/SecurityPage';

/* ─── Inner component — rendered INSIDE PersistGate ─────────── */
function AppRoutes() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);

  // Load public data (categories + brands) once on mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Load user-specific data when token becomes available
  // (this fires after PersistGate has rehydrated the store,
  //  so token is guaranteed to be the real persisted value)
  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(fetchWishlist());
    }
  }, [token, dispatch]);

  return (
    <Routes>
      {/* ── Auth pages (no layout) ───────────────────────── */}
      <Route path="/login"                  element={<LoginPage />} />
      <Route path="/register"               element={<RegisterPage />} />
      <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />

      {/* ── Main layout ─────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route index                        element={<HomePage />} />
        <Route path="shop"                  element={<ShopPage />} />
        <Route path="shop/:category"        element={<ShopPage />} />
        <Route path="product/:slug"         element={<ProductDetailPage />} />
        <Route path="cart"                  element={<CartPage />} />
        <Route path="wishlist"              element={<WishlistPage />} />
        <Route path="blog"                  element={<BlogListPage />} />
        <Route path="blog/:slug"            element={<BlogDetailPage />} />
        <Route path="pages/:slug"           element={<DynamicPage />} />

        {/* ── Protected routes ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout"            element={<CheckoutPage />} />
          <Route path="order-success/:id"   element={<OrderSuccessPage />} />
          <Route path="profile"             element={<ProfileLayout />}>
            <Route index                    element={<ProfilePage />} />
            <Route path="orders"            element={<OrdersPage />} />
            <Route path="orders/:id"        element={<OrderDetailPage />} />
            <Route path="orders/:id/return" element={<ReturnPage />} />
            <Route path="addresses"         element={<AddressesPage />} />
            <Route path="security"          element={<SecurityPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ─── Root App ───────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition:    true,
        v7_relativeSplatPath:  true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontFamily:   'DM Sans, sans-serif',
            fontSize:     '14px',
            fontWeight:   '500',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}
