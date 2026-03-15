import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen:       false,
    mobileMenuOpen: false,
    searchOpen:     false,
  },
  reducers: {
    toggleCart:       (s) => { s.cartOpen       = !s.cartOpen; },
    closeCart:        (s) => { s.cartOpen        = false; },
    openCart:         (s) => { s.cartOpen        = true;  },
    toggleMobileMenu: (s) => { s.mobileMenuOpen  = !s.mobileMenuOpen; },
    closeMobileMenu:  (s) => { s.mobileMenuOpen  = false; },
    toggleSearch:     (s) => { s.searchOpen      = !s.searchOpen; },
    closeSearch:      (s) => { s.searchOpen      = false; },
  },
});

export const {
  toggleCart, closeCart, openCart,
  toggleMobileMenu, closeMobileMenu,
  toggleSearch, closeSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
