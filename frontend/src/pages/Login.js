import React, { useState } from 'react';
import { Typography, Container, TextField, Button, Alert, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setError('');
      setMessage('Login successful! Redirecting...');

      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'vendor':
          navigate('/vendor-dashboard');
          break;
        default:
          navigate('/');
      }

      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('Login Error:', err.response ? err.response.data : err.message);
      setMessage('');
      setError(`Login failed: ${err.response ? err.response.data.message : err.message}`);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter your credentials to log in.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Link
            component="button"
            variant="body2"
            onClick={handleForgotPassword}
            sx={{ mb: 2, textAlign: 'center', display: 'block' }}
          >
            Forgot Password?
          </Link>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;