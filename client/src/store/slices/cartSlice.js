import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:           [],
    coupon:          null,
    discount:        0,
    shippingAddress: null,
    paymentMethod:   'cod',
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, variant = '' } = action.payload;
      const key = `${product._id}-${variant}`;
      const existing = state.items.find(i => `${i._id}-${i.variant || ''}` === key);
      if (existing) {
        const maxQty = product.stock ?? existing.stock ?? 999;
        existing.cartQty = Math.min(existing.cartQty + quantity, maxQty);
        toast.success('Cart updated!');
      } else {
        state.items.push({ ...product, cartQty: quantity, variant });
        toast.success(`${product.name.slice(0, 30)}${product.name.length > 30 ? '…' : ''} added to cart!`);
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        i => `${i._id}-${i.variant || ''}` !== action.payload
      );
    },

    updateCartQty: (state, action) => {
      const { key, quantity } = action.payload;
      const item = state.items.find(i => `${i._id}-${i.variant || ''}` === key);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => `${i._id}-${i.variant || ''}` !== key);
        } else {
          item.cartQty = Math.min(quantity, item.stock ?? 999);
        }
      }
    },

    clearCart: (state) => {
      state.items    = [];
      state.coupon   = null;
      state.discount = 0;
    },

    applyCoupon: (state, action) => {
      state.coupon   = action.payload.coupon;
      state.discount = action.payload.discount;
      toast.success(`Coupon applied! You save $${action.payload.discount.toFixed(2)} 🎉`);
    },

    removeCoupon: (state) => {
      state.coupon   = null;
      state.discount = 0;
      toast.success('Coupon removed');
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

/* ─── Selectors ─────────────────────────────────────────────── */
export const selectCartItems     = (s) => s.cart.items;
export const selectCartCount     = (s) => s.cart.items.reduce((acc, i) => acc + i.cartQty, 0);
export const selectCartSubtotal  = (s) =>
  s.cart.items.reduce((acc, i) => {
    const price = i.discount > 0
      ? +(i.price * (1 - i.discount / 100)).toFixed(2)
      : i.price;
    return acc + price * i.cartQty;
  }, 0);
export const selectCartTotal = (s) => {
  const subtotal = selectCartSubtotal(s);
  const shipping = subtotal > 50 ? 0 : subtotal > 0 ? 5.99 : 0;
  const tax      = +(subtotal * 0.1).toFixed(2);
  return +(subtotal + shipping + tax - (s.cart.discount || 0)).toFixed(2);
};

export const {
  addToCart, removeFromCart, updateCartQty, clearCart,
  applyCoupon, removeCoupon, saveShippingAddress, setPaymentMethod,
} = cartSlice.actions;

export default cartSlice.reducer;
