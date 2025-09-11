import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, 
  IconButton, Tab, Tabs, Card, CardContent, Grid, Alert // eslint-disable-next-line no-unused-vars
  , Dialog, DialogActions, DialogContent, DialogTitle 
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout } from '../redux/authSlice'; // Import logout

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false); // eslint-disable-line no-unused-vars
  const [editItem, setEditItem] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch token from Redux at the top level
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        const [usersRes, servicesRes, bookingsRes, analyticsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/services', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data);
        setServices(servicesRes.data);
        setBookings(bookingsRes.data);
        setAnalytics(analyticsRes.data);
        console.log('Admin Data:', { users: usersRes.data.length, services: servicesRes.data.length, bookings: bookingsRes.data.length, analytics: analyticsRes.data });
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = io('http://localhost:5000');
    socket.on('connect_error', (err) => console.error('WebSocket error:', err.message));
    socket.on('serviceAdded', (service) => setServices(prev => [...prev, service]));
    socket.on('bookingAdded', (booking) => setBookings(prev => [...prev, booking]));

    return () => socket.disconnect();
  }, [navigate, token]);

  useEffect(() => {
    // Initialize token from localStorage on mount if not set
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      dispatch(setCredentials({ token: storedToken }));
    }
  }, [dispatch, token]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleEdit = (item, type) => {
    setEditItem({ ...item, type, id: item._id });
    setOpenDialog(true);
  };

  const handleSave = async () => { // eslint-disable-line no-unused-vars
    if (!editItem?.id) {
      setError('No item ID to update');
      return;
    }
    try {
      const endpoint = editItem.type === 'user' ? '/admin/users' : editItem.type === 'service' ? '/admin/services' : '/admin/bookings';
      await axios.put(`http://localhost:5000/api${endpoint}/${editItem.id}`, editItem, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Item updated successfully');
      setOpenDialog(false);
      const fetchFunctions = {
        user: () => setUsers(prev => prev.map(u => u._id === editItem.id ? editItem : u)),
        service: () => setServices(prev => prev.map(s => s._id === editItem.id ? editItem : s)),
        booking: () => setBookings(prev => prev.map(b => b._id === editItem.id ? editItem : b)),
      };
      fetchFunctions[editItem.type]();
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  const handleDelete = async (id, type) => {
    if (!id) {
      setError('No item ID to delete');
      return;
    }
    try {
      const endpoint = type === 'user' ? '/admin/users' : type === 'service' ? '/admin/services' : '/admin/bookings';
      await axios.delete(`http://localhost:5000/api${endpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Item deleted successfully');
      const updateFunctions = {
        user: () => setUsers(prev => prev.filter(u => u._id !== id)),
        service: () => setServices(prev => prev.filter(s => s._id !== id)),
        booking: () => setBookings(prev => prev.filter(b => b._id !== id)),
      };
      updateFunctions[type]();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const handleApproveService = async (id) => {
    if (!id) {
      setError('No service ID to approve');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/admin/services/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Service approved successfully');
      setServices(prev => prev.map(s => s._id === id ? { ...s, status: 'approved' } : s));
    } catch (err) {
      setError('Failed to approve service');
      console.error(err);
    }
  };

  const handleUpdateBooking = async (id, status) => {
    if (!id) {
      setError('No booking ID to update');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Booking updated successfully');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      setError('Failed to update booking');
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout()); // Use imported logout action
    navigate('/login');
  };

  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(search.toLowerCase()) || '');

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 4 }}>
            <Tab label="Users" />
            <Tab label="Services" />
            <Tab label="Bookings" />
            <Tab label="Analytics" />
          </Tabs>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6">User Management</Typography>
              <TextField
                label="Search by Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(user, 'user')}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(user._id, 'user')}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton onClick={() => handleUpdateBooking(user._id, 'banned')}>
                            <BlockIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>No users found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6">Service Approval</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.length > 0 ? (
                    services.map(service => (
                      <TableRow key={service._id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.price}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>{service.vendorId?.name || 'N/A'}</TableCell>
                        <TableCell>{service.status}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleApproveService(service._id)}>
                            <CheckIcon />
                          </IconButton>
                          <IconButton onClick={() => handleEdit(service, 'service')}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(service._id, 'service')}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>No services found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6">Booking Management</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length > 0 ? (
                    bookings.map(booking => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking.customerId?.name || 'N/A'}</TableCell>
                        <TableCell>{booking.serviceId?.title || 'N/A'}</TableCell>
                        <TableCell>{booking.date || 'N/A'}</TableCell>
                        <TableCell>{booking.status}</TableCell>
                        <TableCell>
                          <Button variant="contained" onClick={() => handleUpdateBooking(booking._id, 'confirmed')}>
                            Confirm
                          </Button>
                          <Button variant="contained" color="error" onClick={() => handleUpdateBooking(booking._id, 'cancelled')} sx={{ ml: 1 }}>
                            Cancel
                          </Button>
                          <IconButton onClick={() => handleEdit(booking, 'booking')}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(booking._id, 'booking')}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No bookings found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6">Analytics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Users</Typography>
                      <Typography variant="h4">{analytics.totalUsers || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Services</Typography>
                      <Typography variant="h4">{analytics.totalServices || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Bookings</Typography>
                      <Typography variant="h4">{analytics.totalBookings || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Revenue</Typography>
                      <Typography variant="h4">${analytics.totalRevenue || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Revenue Trend</Typography>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    datasets: [
                      {
                        label: 'Revenue ($)',
                        data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300],
                        borderColor: 'blue',
                        fill: false,
                      },
                    ],
                  }}
                  options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
                />
              </Box>
            </Box>
          )}
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 4}}>
            Logout
          </Button>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;