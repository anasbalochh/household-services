import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/authSlice';
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, Box, Alert, Link } from '@mui/material';

const VendorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password, role: 'vendor' });
        dispatch(login({ token: response.data.token, role: response.data.role, email }));
        navigate('/service-creation'); // Redirect to Create Service after login
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role: 'vendor' });
        dispatch(login({ token: response.data.token, role: response.data.role, email }));
        navigate('/service-creation'); // Redirect to Create Service after registration
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ maxWidth: 300, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            {isLogin ? 'Vendor Login' : 'Vendor Register'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="dense"
                size="small"
              />
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              size="small"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, mb: 1 }}>
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Button variant="text" onClick={() => setIsLogin(!isLogin)} fullWidth sx={{ mb: 1 }}>
              {isLogin ? 'Need to Register?' : 'Back to Login'}
            </Button>
            <Link href="/forgot-password" underline="hover" sx={{ display: 'block', textAlign: 'center', fontSize: '0.8rem' }}>
              Forgot Password?
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorLogin;