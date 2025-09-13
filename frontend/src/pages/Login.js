import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, role } = response.data;
      dispatch(setCredentials({ token, role })); // Store role too
      localStorage.setItem('token', token); // Store token
      console.log('Token stored:', token.substring(0, 20) + '...'); // Debug log
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'customer') navigate('/customer-dashboard');
      else if (role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login Error:', err.response?.data || err);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>Login</Button>
      </form>
      <Box sx={{ mt: 2 }}>
        <Button variant="text" onClick={() => navigate('/forgot-password')} sx={{ mr: 2 }}>
          Forgot Password
        </Button>
        <Button variant="text" onClick={() => navigate('/register')}>
          Register
        </Button>
      </Box>
    </Container>
  );
};

export default Login;