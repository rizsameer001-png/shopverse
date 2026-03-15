import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Build headers using token from Redux state (via getState)
const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

/* ─── Async Thunks ───────────────────────────────────────────── */

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/auth/register`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/auth/login`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid email or password');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const token = getState().auth.token;
    try {
      await axios.get(`${BASE}/auth/logout`, { headers: authHeaders(token) });
    } catch (_) {}
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await axios.get(`${BASE}/auth/me`, {
        headers: authHeaders(token),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const res = await axios.put(`${BASE}/auth/update-profile`, data, {
        headers: authHeaders(token),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (data, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const res = await axios.put(`${BASE}/auth/update-password`, data, {
        headers: authHeaders(token),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password update failed');
    }
  }
);

/* ─── Slice ──────────────────────────────────────────────────── */

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    const setPending  = (s) => { s.loading = true; s.error = null; };
    const setRejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      // register
      .addCase(register.pending, setPending)
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.token;
        toast.success(`Account created! Welcome, ${a.payload.user.name} 🎉`);
      })
      .addCase(register.rejected, (s, a) => {
        setRejected(s, a);
        toast.error(a.payload || 'Registration failed');
      })

      // login
      .addCase(login.pending, setPending)
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.token;
        toast.success(`Welcome back, ${a.payload.user.name}! 👋`);
      })
      .addCase(login.rejected, (s, a) => {
        setRejected(s, a);
        toast.error(a.payload || 'Login failed');
      })

      // logout
      .addCase(logout.fulfilled, (s) => {
        s.user  = null;
        s.token = null;
        toast.success('Logged out successfully');
      })

      // getMe
      .addCase(getMe.fulfilled, (s, a) => {
        s.user = a.payload.data;
      })
      .addCase(getMe.rejected, (s) => {
        // Token is invalid / expired → clear session silently
        s.user  = null;
        s.token = null;
      })

      // updateProfile
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.data;
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (s, a) => {
        setRejected(s, a);
        toast.error(a.payload || 'Update failed');
      })

      // updatePassword
      .addCase(updatePassword.pending, setPending)
      .addCase(updatePassword.fulfilled, (s) => {
        s.loading = false;
        toast.success('Password updated successfully!');
      })
      .addCase(updatePassword.rejected, (s, a) => {
        setRejected(s, a);
        toast.error(a.payload || 'Password update failed');
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
