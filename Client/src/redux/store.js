import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer, // The reducer from authSlice
  },
});

export default store;