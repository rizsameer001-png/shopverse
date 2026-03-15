import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/products', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories', { params: { isActive: true } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/brands', { params: { isActive: true } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const INITIAL_FILTERS = {
  keyword:    '',
  category:   '',
  brand:      '',
  minPrice:   '',
  maxPrice:   '',
  minRating:  '',
  sort:       'newest',
  page:       1,
  limit:      12,
};

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items:      [],
    total:      0,
    pages:      1,
    page:       1,
    current:    null,
    categories: [],
    brands:     [],
    loading:    false,
    error:      null,
    filters:    INITIAL_FILTERS,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = { ...INITIAL_FILTERS };
    },
    clearCurrentProduct: (state) => {
      state.current = null;
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error   = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        s.items   = a.payload.data  || [];
        s.total   = a.payload.total || 0;
        s.pages   = a.payload.pages || 1;
        s.page    = a.payload.page  || 1;
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload;
        s.items   = [];
      })

      .addCase(fetchProduct.pending, (s) => {
        s.loading = true;
        s.current = null;
        s.error   = null;
      })
      .addCase(fetchProduct.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload.data;
      })
      .addCase(fetchProduct.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload;
        s.current = null;
      })

      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.categories = a.payload.data || [];
      })
      .addCase(fetchBrands.fulfilled, (s, a) => {
        s.brands = a.payload.data || [];
      });
  },
});

export const { setFilter, setPage, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
