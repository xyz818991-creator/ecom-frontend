import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import Landing from './pages/Landing';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BuyNow from './pages/BuyNow';
import Account from './pages/Account';
import UserSettings from './pages/UserSettings';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
              {/* Brand Landing Page with Collections & Shop The Edit */}
              <Route path="/" element={<Landing />} />

              {/* Dedicated Single-Vendor E-Commerce Store Home Page */}
              <Route path="/home" element={<HomePage />} />

              {/* Store & Catalogue Pages - supports /store, /shop and categories */}
              <Route path="/store" element={<ProductListing />} />
              <Route path="/store/:categorySlug" element={<ProductListing />} />
              <Route path="/shop" element={<ProductListing />} />
              <Route path="/category/:categorySlug" element={<ProductListing />} />
              <Route path="/collections/:categorySlug" element={<ProductListing />} />
              <Route path="/collection/:categorySlug" element={<ProductListing />} />

              {/* Product Details & Customer Experience */}
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/buy-now" element={<BuyNow />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/account/settings" element={<UserSettings />} />
              <Route path="/orders" element={<Account />} />
              <Route path="/track-order" element={<OrderTracking />} />
              <Route path="/track-order/:orderNumber" element={<OrderTracking />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/reviews" element={<Feedback />} />

              {/* Authentication (redirects to Landing Page upon sign in) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Management Portal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/*" element={<AdminLayout />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </StoreProvider>
  </BrowserRouter>
  );
}
