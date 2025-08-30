import React, { useEffect } from 'react';
import { Typography, Container } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/protected', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(response.data); // Handle the response data
        } catch (err) {
          console.error('Protected route access failed:', err);
        }
      }
    };
    fetchProtectedData();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Typography>Admin controls go here.</Typography>
    </Container>
  );
};

export default AdminDashboard;