import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, Box, Alert } from '@mui/material';

const BookingCreation = () => {
  const [serviceId, setServiceId] = useState('');
  const [error, setError] = useState('');
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', { serviceId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingId = response.data.id;
      navigate(`/booking-details/${bookingId}`); // Redirect to booking details
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ maxWidth: 300, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">Create Booking</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Service ID"
              name="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              margin="dense"
              size="small"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, mb: 1 }}>
              Book Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingCreation;