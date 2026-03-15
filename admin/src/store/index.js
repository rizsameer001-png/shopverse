import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/* ─── Axios instance ─────────────────────────────────────────────
   Token is injected via setAdminStore() called from main.jsx AFTER
   the store is created — no circular imports, no localStorage race.  */

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Mutable store reference — set once in main.jsx before any render
let _store = null;
export const setAdminStore = (s) => { _store = s; };

// Attach JWT from Redux state on EVERY request
api.interceptors.request.use(
  (config) => {
    if (_store) {
      const token = _store.getState()?.auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear state and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (_store) {
        _store.dispatch({ type: 'auth/logout/fulfilled' });
      }
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth Slice ─────────────────────────────────────────────── */
export const adminLogin = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/auth/login`, data);
      if (!['admin', 'superadmin'].includes(res.data.user?.role)) {
        return rejectWithValue('Access denied: Admin privileges required');
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid credentials'
      );
    }
  }
);

export const adminLogout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const token = getState().auth?.token;
    try {
      await axios.get(`${BASE}/auth/logout`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (_) {}
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(adminLogin.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.token;
        toast.success(`Welcome back, ${a.payload.user.name}! 👋`);
      })
      .addCase(adminLogin.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload;
        toast.error(a.payload || 'Login failed');
      })
      .addCase(adminLogout.fulfilled, (s) => {
        s.user  = null;
        s.token = null;
        toast.success('Logged out successfully');
      });
  },
});

/* ─── Store ──────────────────────────────────────────────────── */
const rootReducer = combineReducers({ auth: authSlice.reducer });

const persistConfig = {
  key: 'shopverse-admin',
  version: 1,
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);
export const { clearError } = authSlice.actions;
