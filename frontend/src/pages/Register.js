import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { email, password, role, name: email.split('@')[0] });
      console.log('Registration successful:', response.data);
      setError('');
      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} required />
        <Select value={role} onChange={(e) => setRole(e.target.value)} fullWidth sx={{ mb: 2 }} required>
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="vendor">Vendor</MenuItem>
        </Select>
        <Button type="submit" variant="contained" fullWidth>Register</Button>
      </form>
    </Container>
  );
};

export default Register;