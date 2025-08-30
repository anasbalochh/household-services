const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware');

// Mock service data (replace with database in production)
let services = [
  { id: 1, name: 'Plumbing', price: 50, description: 'Fix leaks and pipes', vendorId: 1 },
  { id: 2, name: 'Cleaning', price: 30, description: 'Home cleaning services', vendorId: 1 },
  { id: 3, name: 'Electrical', price: 70, description: 'Wiring and repairs', vendorId: 1 },
];

// Mock bookings data (for customers)
let bookings = [];

// Get all services (for customers and vendors, filtered by vendor)
router.get('/services', authenticateToken, (req, res) => {
  const vendorServices = services.filter(s => s.vendorId === req.user.id || req.user.role === 'customer');
  res.json(vendorServices);
});

// Add a service (for vendors)
router.post('/services', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Unauthorized' });
  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const newService = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    description,
    vendorId: req.user.id,
  };
  services.push(newService);
  res.status(201).json({ message: 'Service added', service: newService });
});

// Update a service (for vendors)
router.put('/services/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Unauthorized' });
  const { id } = req.params;
  const { name, price, description } = req.body;
  const serviceIndex = services.findIndex(s => s.id === parseInt(id) && s.vendorId === req.user.id);
  if (serviceIndex === -1) return res.status(404).json({ message: 'Service not found or unauthorized' });
  services[serviceIndex] = { ...services[serviceIndex], name, price: parseFloat(price), description };
  res.json({ message: 'Service updated', service: services[serviceIndex] });
});

// Delete a service (for vendors)
router.delete('/services/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Unauthorized' });
  const { id } = req.params;
  const serviceIndex = services.findIndex(s => s.id === parseInt(id) && s.vendorId === req.user.id);
  if (serviceIndex === -1) return res.status(404).json({ message: 'Service not found or unauthorized' });
  services.splice(serviceIndex, 1);
  res.json({ message: 'Service deleted' });
});

// Book a service (for customers)
router.post('/bookings', authenticateToken, (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Unauthorized' });
  const { serviceId, date } = req.body;
  const service = services.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const booking = {
    id: Date.now(),
    userId: req.user.id,
    serviceId,
    serviceName: service.name,
    date,
    status: 'pending',
  };
  bookings.push(booking); // Store booking
  res.status(201).json({ message: 'Service booked', booking });
});

// Get bookings (for customers, optional extension)
router.get('/bookings', authenticateToken, (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Unauthorized' });
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
});

module.exports = router;