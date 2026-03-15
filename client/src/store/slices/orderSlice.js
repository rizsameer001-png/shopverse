import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', orderData);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to place order'); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const requestReturn = createAsyncThunk('orders/return', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/return`, { reason });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Return request failed'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], current: null, total: 0, pages: 1, loading: false, error: null },
  reducers: {
    clearOrderError: (s) => { s.error = null; },
    clearCurrentOrder: (s) => { s.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => {
        s.loading = false; s.current = a.payload.data;
        toast.success('Order placed successfully! 🎉');
      })
      .addCase(createOrder.rejected, (s, a) => {
        s.loading = false; s.error = a.payload;
        toast.error(a.payload || 'Failed to place order');
      })

      .addCase(fetchMyOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.items  = a.payload.data;
        s.total  = a.payload.total;
        s.pages  = a.payload.pages;
      })
      .addCase(fetchMyOrders.rejected, (s) => { s.loading = false; })

      .addCase(fetchOrder.pending, (s) => { s.loading = true; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.loading = false; s.current = a.payload.data; })
      .addCase(fetchOrder.rejected, (s) => { s.loading = false; })

      .addCase(requestReturn.fulfilled, (s, a) => {
        s.current = a.payload.data;
        toast.success('Return request submitted successfully!');
      })
      .addCase(requestReturn.rejected, (s, a) => {
        toast.error(a.payload || 'Return request failed');
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
