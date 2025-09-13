import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography, Container, TextField, Button, Box,
  Table, TableBody, TableCell, TableHead, TableRow, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const VendorDashboard = () => {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // vendor bookings list
  const [vendorBookings, setVendorBookings] = useState([]);

  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // join room + notifications
  useEffect(() => {
    if (user?.id) socket.emit('joinRoom', user.id);
    const onNote = (data) => {
      setMessage(data.message || 'Update');
      setTimeout(() => setMessage(''), 5000);
    };
    socket.on('bookingNotification', onNote);
    return () => socket.off('bookingNotification', onNote);
  }, [user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) {
          setError('Authentication required. Please log in.');
          navigate('/login');
          return;
        }
        // fetch all services, then filter by this vendor
        const servicesRes = await axios.get('http://localhost:5000/api/services', authHeader);
        setServices((servicesRes.data || []).filter(s => String(s.vendorId) === String(user?.id)));

        // fetch bookings for vendor's services (server populates customerId & serviceId)
        const bookingsRes = await axios.get('http://localhost:5000/api/vendor/bookings', authHeader);
        setVendorBookings(bookingsRes.data || []);
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        setServices([]);
        setVendorBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, authHeader, token, user?.id]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      setError('All fields are required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/services',
        { name, price: parseFloat(price), description },
        authHeader
      );
      setServices([...services, response.data.service]);
      setMessage('Service added successfully!');
      setName('');
      setPrice('');
      setDescription('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to add service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/vendor/services/${id}`, authHeader);
      setServices(services.filter(s => (s._id || s.id) !== id));
      setMessage('Service deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete service: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, authHeader);
      setVendorBookings(prev => prev.map(b => (b._id === bookingId ? res.data.booking : b)));
      setMessage('Booking cancelled');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Cancel failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContact = (b) => {
    const phone = b?.customerId?.phone || '';
    const email = b?.customerId?.email || '';
    if (!phone && !email) return <strong>No phone</strong>;
    return (
      <>
        {email && <div>{email}</div>}
        {phone && <div><strong>{phone}</strong></div>}
      </>
    );
  };

  // 🔧 FIX: also consider profile coordinates if no address is present
  const renderLocation = (b) => {
    // Prefer job-specific booking location
    const job = b?.customerLocation;
    if (job?.address) return job.address;
    if (Array.isArray(job?.coordinates) && job.coordinates.length === 2) {
      return `(${job.coordinates[1]}, ${job.coordinates[0]})`; // lat, lng
    }

    // Fallback to the user's saved profile location
    const userLoc = b?.customerId?.location;
    if (userLoc?.address) return userLoc.address;
    if (Array.isArray(userLoc?.coordinates) && userLoc.coordinates.length === 2) {
      return `(${userLoc.coordinates[1]}, ${userLoc.coordinates[0]})`; // lat, lng
    }

    return '—';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Vendor Dashboard</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {/* Add service */}
          <Box component="form" onSubmit={handleAddService} sx={{ mb: 4 }}>
            <TextField label="Service Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <TextField label="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" color="primary">Add Service</Button>
          </Box>

          {/* Your services */}
          {services.length > 0 ? (
            <Table sx={{ mb: 4 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price ($)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map(s => {
                  const id = s._id || s.id;
                  return (
                    <TableRow key={id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.price}</TableCell>
                      <TableCell>{s.description}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="error" onClick={() => handleDeleteService(id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography>No services added yet.</Typography>
          )}

          {/* Bookings for your services */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Bookings for Your Services</Typography>
          {vendorBookings.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Customer Location</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorBookings.map(b => (
                  <TableRow key={b._id}>
                    <TableCell>{b?.customerId?.name || 'N/A'}</TableCell>
                    <TableCell>{renderContact(b)}</TableCell>
                    <TableCell>{b?.serviceId?.name || 'N/A'}</TableCell>
                    <TableCell>{b?.date || 'N/A'}</TableCell>
                    <TableCell>{b?.status || 'N/A'}</TableCell>
                    <TableCell>{renderLocation(b)}</TableCell>
                    <TableCell>
                      {b.status !== 'cancelled' && (
                        <Button variant="outlined" color="error" onClick={() => cancelBooking(b._id)}>
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No bookings yet.</Typography>
          )}

          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 3 }}>
            Logout
          </Button>
        </>
      )}
    </Container>
  );
};

export default VendorDashboard;
