import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer     from './slices/authSlice';
import cartReducer     from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import productReducer  from './slices/productSlice';
import orderReducer    from './slices/orderSlice';
import uiReducer       from './slices/uiSlice';

const rootReducer = combineReducers({
  auth:     authReducer,
  cart:     cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  orders:   orderReducer,
  ui:       uiReducer,
});

const persistConfig = {
  key: 'shopverse',
  version: 1,
  storage,
  whitelist: ['auth', 'cart', 'wishlist'],
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
