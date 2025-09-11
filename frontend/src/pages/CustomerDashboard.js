import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Button, Box, Table, TableBody, TableCell, TableHead, TableRow, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [servicesRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/services', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setServices(servicesRes.data);
        setBookings(bookingsRes.data);
        console.log('Customer Data:', { services: servicesRes.data.length, bookings: bookingsRes.data.length });
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Customer fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleBookService = (service) => setSelectedService(service);

  const confirmBooking = async () => {
    if (!selectedService || !bookingDate) {
      setError('Please select a service and date');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/bookings', {
        serviceId: selectedService._id,
        date: bookingDate,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookings([...bookings, response.data.booking]);
      setMessage('Service booked successfully!');
      setSelectedService(null);
      setBookingDate('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Booking failed');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Customer Dashboard</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Search Services"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Price ($)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.map(service => (
                  <TableRow key={service._id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleBookService(service)}>
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                fullWidth
                sx={{ mt: 2, mb: 2 }}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Button variant="contained" onClick={confirmBooking} sx={{ mr: 2 }}>
                Confirm
              </Button>
              <Button variant="outlined" onClick={() => setSelectedService(null)}>
                Cancel
              </Button>
            </Box>
          )}
          {bookings.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Your Bookings</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking.serviceId?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.date || 'N/A'}</TableCell>
                      <TableCell>{booking.status || 'N/A'}</TableCell>
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