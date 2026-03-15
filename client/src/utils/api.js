import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Store reference injected after store creation (avoids circular import)
let _store = null;
export const injectStore = (store) => { _store = store; };

// Attach JWT from Redux state on every request
api.interceptors.request.use(
  (config) => {
    if (_store) {
      const token = _store.getState()?.auth?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401: clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && _store) {
      // Silently clear auth — getMe rejection handler will do the same
      // Only redirect if not already on an auth page
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/forgot') && !path.startsWith('/reset')) {
        // Don't hard-redirect — let React Router handle it via ProtectedRoute
        _store.dispatch({ type: 'auth/logout/fulfilled' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
