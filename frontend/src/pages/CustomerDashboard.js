import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Container, TextField, Button, Box,
  Table, TableBody, TableCell, TableHead, TableRow, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // booking location fields
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  // Memoize headers so effects can safely depend on it
  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // join socket room & notifications
  useEffect(() => {
    if (user?.id) socket.emit('joinRoom', user.id);
    const onNote = (data) => { setMessage(data.message || 'Update'); setTimeout(() => setMessage(''), 5000); };
    socket.on('bookingNotification', onNote);
    return () => socket.off('bookingNotification', onNote);
  }, [user?.id]);

  // fetch services & bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) { setError('Authentication required. Please log in.'); navigate('/login'); return; }
        const [servicesRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/customer/services', authHeader),
          axios.get('http://localhost:5000/api/bookings', authHeader),
        ]);
        setServices(servicesRes.data || []);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, authHeader, token]);

  const filteredServices = services.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const handleBookService = (service) => setSelectedService(service);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setMessage('Location captured');
        setTimeout(() => setMessage(''), 2000);
      },
      (err) => setError('Location error: ' + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const confirmBooking = async () => {
    if (!selectedService || !bookingDate) { setError('Please select a service and date'); return; }
    try {
      const payload = {
        serviceId: selectedService._id || selectedService.id,
        date: bookingDate,
      };
      // attach location if provided
      if (address || (lat && lng)) {
        payload.location = {
          address: address || '',
          coordinates: (lat && lng) ? [Number(lng), Number(lat)] : undefined, // [lng, lat]
        };
      }

      const res = await axios.post('http://localhost:5000/api/bookings', payload, authHeader);
      setBookings([...bookings, res.data.booking]);
      setMessage('Service booked successfully!');
      setSelectedService(null);
      setBookingDate('');
      setAddress('');
      setLat('');
      setLng('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, authHeader);
      setBookings(bookings.map(b => b._id === bookingId ? res.data.booking : b));
      setMessage('Booking cancelled');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Cancel failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ Use this in the button so it’s not “unused”
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Customer Dashboard</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <TextField label="Search Services" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Price ($)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Vendor Contact</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.length > 0 ? filteredServices.map(service => (
                  <TableRow key={service._id || service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      {(service.vendorId?.name || 'N/A')}<br />
                      {(service.vendorId?.email || '')}<br />
                      <strong>{service.vendorId?.phone || 'No phone'}</strong>
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleBookService(service)}>Book</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5}>No services available.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {selectedService && (
            <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6">Book {selectedService.name}</Typography>
              <TextField
                label="Booking Date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                fullWidth sx={{ mt: 2, mb: 2 }}
                InputLabelProps={{ shrink: true }}
                required
              />

              {/* Customer location input */}
              <TextField
                label="Address (optional)"
                placeholder="House/Street/City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField label="Latitude (optional)" value={lat} onChange={(e) => setLat(e.target.value)} fullWidth />
                <TextField label="Longitude (optional)" value={lng} onChange={(e) => setLng(e.target.value)} fullWidth />
              </Box>
              <Button onClick={useMyLocation} sx={{ mb: 2 }}>Use My Current Location</Button><br/>

              <Button variant="contained" onClick={confirmBooking} sx={{ mr: 2 }}>Confirm</Button>
              <Button variant="outlined" onClick={() => setSelectedService(null)}>Cancel</Button>
            </Box>
          )}

          {bookings.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Your Bookings</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Vendor Contact</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking._id || booking.id}>
                      <TableCell>{booking.serviceId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {(booking.serviceId?.vendorId?.name || 'N/A')}<br />
                        {booking.serviceId?.vendorId?.email || ''}<br />
                        <strong>{booking.serviceId?.vendorId?.phone || 'No phone'}</strong>
                      </TableCell>
                      <TableCell>{booking.date || 'N/A'}</TableCell>
                      <TableCell>{booking.status || 'N/A'}</TableCell>
                      <TableCell>
                        {booking.status !== 'cancelled' && (
                          <Button variant="outlined" color="error" onClick={() => cancelBooking(booking._id)}>
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </>
      )}
    </Container>
  );
};

export default CustomerDashboard;
