import { configureStore } from '@reduxjs/toolkit';
  import authReducer from './authSlice';
  import serviceReducer from './serviceSlice';
  import bookingReducer from './bookingSlice';

  export default configureStore({
    reducer: {
      auth: authReducer,
      services: serviceReducer,
      bookings: bookingReducer,
    },
  });