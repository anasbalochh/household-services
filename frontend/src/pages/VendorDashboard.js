import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Button, Box, Table, TableBody, TableCell, TableHead, TableRow, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VendorDashboard = () => {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [editService, setEditService] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
        console.log('Vendor Services:', response.data.length);
      } catch (err) {
        setError('Failed to fetch services');
        console.error('Vendor fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleAddService = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/services', {
        name,
        price,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices([...services, response.data.service]); // Assuming service is returned
      setMessage('Service added successfully!');
      setName('');
      setPrice('');
      setDescription('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to add service');
      console.error(err);
    }
  };

  const handleEditService = (service) => {
    setEditService(service);
    setName(service.name);
    setPrice(service.price);
    setDescription(service.description);
    setOpenDialog(true);
  };

  const handleUpdateService = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/services/${editService._id}`, {
        name,
        price,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.map(s => s._id === editService._id ? { ...s, name, price, description } : s));
      setMessage('Service updated successfully!');
      setEditService(null);
      setName('');
      setPrice('');
      setDescription('');
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to update service');
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter(s => s._id !== id));
      setMessage('Service deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Vendor Dashboard</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Add New Service</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="Service Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} required />
              <TextField label="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} sx={{ flex: 1 }} required />
              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ flex: 2 }} required />
              <Button variant="contained" onClick={handleAddService} sx={{ mt: 1 }}>Add Service</Button>
            </Box>
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          </Box>
          <Typography variant="h6">Manage Services</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Price ($)</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map(service => (
                <TableRow key={service._id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEditService(service)} sx={{ mr: 1 }}>Edit</Button>
                    <Button variant="contained" color="error" onClick={() => handleDeleteService(service._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogContent>
              <TextField label="Service Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth sx={{ mt: 2, mb: 2 }} required />
              <TextField label="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth sx={{ mb: 2 }} required />
              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth sx={{ mb: 2 }} required />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateService} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 4 }}>Logout</Button>
        </>
      )}
    </Container>
  );
};

export default VendorDashboard;