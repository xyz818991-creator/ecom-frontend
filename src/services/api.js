import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tee_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Smart Response interceptor: handles Vite proxy, direct port 5000 and port 5001 fallback
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest &&
      !originalRequest._retryCount &&
      (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.response?.status === 404)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // If /api failed, try direct port 5000
      if (originalRequest.baseURL === '/api') {
        originalRequest.baseURL = 'http://localhost:5000/api';
        return api.request(originalRequest);
      }
      // If port 5000 failed, try port 5001
      if (originalRequest.baseURL?.includes(':5000')) {
        originalRequest.baseURL = originalRequest.baseURL.replace(':5000', ':5001');
        return api.request(originalRequest);
      }
    }
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// 1. Auth Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// 2. Product Services
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  adminGetProducts: (params) => api.get('/products/admin/all', { params }),
  createProduct: (data) => api.post('/products/admin', data),
  updateProduct: (id, data) => api.put(`/products/admin/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/admin/${id}`),
  togglePublish: (id) => api.patch(`/products/admin/${id}/publish`)
};

// 3. Category Services
export const categoryService = {
  getCategories: () => api.get('/categories'),
  adminGetCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories/admin', data),
  updateCategory: (id, data) => api.put(`/categories/admin/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/admin/${id}`)
};

// 4. Order Services
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders/my-orders'),
  getOrderById: (orderNumber) => api.get(`/orders/${orderNumber}`),
  adminGetOrders: (params) => api.get('/orders/admin/all', { params }),
  adminUpdateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
  adminUpdateStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data)
};

// 5. Coupon Services
export const couponService = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  applyCoupon: (data) => api.post('/coupons/apply', data),
  adminGetCoupons: () => api.get('/coupons/admin'),
  createCoupon: (data) => api.post('/coupons/admin', data),
  toggleCoupon: (id) => api.patch(`/coupons/admin/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/coupons/admin/${id}`)
};

// 6. Banner Services
export const bannerService = {
  getBanners: () => api.get('/banners'),
  adminGetBanners: () => api.get('/banners/admin/all'),
  createBanner: (data) => api.post('/banners/admin', data),
  updateBanner: (id, data) => api.put(`/banners/admin/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/admin/${id}`)
};

// 7. Admin File Upload & Operations Services
export const adminService = {
  uploadSingle: (formData) =>
    api.post('/admin/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadMultiple: (formData) =>
    api.post('/admin/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getInventory: () => api.get('/admin/inventory'),
  adjustStock: (data) => api.post('/admin/inventory/adjust', data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  toggleCustomerStatus: (id) => api.patch(`/admin/customers/${id}/toggle`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  testCloudinary: (data) => api.post('/admin/uploads/test-connection', data)
};

// 8. Analytics Services
export const analyticsService = {
  getDashboardStats: () => api.get('/admin/dashboard')
};

// 9. Payment Services (Razorpay & Online Checkout)
export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data)
};

// 10. Public Store Settings Service (Customer Storefront sync)
export const settingsService = {
  getSettings: () => api.get('/settings')
};

// 10. Customer Reviews & Feedback Services
export const reviewService = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  uploadImage: (formData) =>
    api.post('/uploads/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default api;
