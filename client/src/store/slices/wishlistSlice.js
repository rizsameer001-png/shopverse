import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Not authenticated');
    try {
      const res = await api.get('/wishlist');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      toast.error('Please sign in to use wishlist');
      return rejectWithValue('Not authenticated');
    }
    try {
      const res = await api.post(`/wishlist/toggle/${productId}`);
      return { ...res.data, productId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Wishlist update failed');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    clearWishlist: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (s) => { s.loading = true; })
      .addCase(fetchWishlist.fulfilled, (s, action) => {
        s.loading = false;
        const products = action.payload.data?.products || [];
        // Store product IDs as plain strings for reliable comparison
        s.items = products.map(p => {
          const raw = p.product?._id || p.product || p._id || p;
          return String(raw);
        }).filter(Boolean);
      })
      .addCase(fetchWishlist.rejected, (s) => {
        s.loading = false;
        s.items = [];
      })

      .addCase(toggleWishlist.fulfilled, (s, action) => {
        const { productId, added } = action.payload;
        const id = String(productId);
        if (added) {
          if (!s.items.includes(id)) s.items.push(id);
          toast.success('Added to wishlist ❤️');
        } else {
          s.items = s.items.filter(i => i !== id);
          toast.success('Removed from wishlist');
        }
      })
      .addCase(toggleWishlist.rejected, (s, action) => {
        if (action.payload !== 'Not authenticated') {
          toast.error(action.payload || 'Wishlist update failed');
        }
      });
  },
});

// Selector: returns true if the given productId is in the wishlist
export const selectIsWishlisted = (productId) => (state) => {
  if (!productId) return false;
  return state.wishlist.items.includes(String(productId));
};

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
