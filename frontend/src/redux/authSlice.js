import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    userId: localStorage.getItem('userId') || null,
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.userId = action.payload.userId || null;
      state.name = action.payload.name || null;
      state.email = action.payload.email || null;
      localStorage.setItem('token', state.token);
      localStorage.setItem('role', state.role);
      localStorage.setItem('userId', state.userId || '');
      localStorage.setItem('name', state.name || '');
      localStorage.setItem('email', state.email || '');
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.name = null;
      state.email = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
    },
    updateProfile: (state, action) => {
      state.name = action.payload.name || state.name;
      state.email = action.payload.email || state.email;
      localStorage.setItem('name', state.name);
      localStorage.setItem('email', state.email);
    },
  },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;