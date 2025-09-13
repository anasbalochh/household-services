const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const authenticateToken = require('../Middleware/authenticateToken');
const authorizeVendor = require('../Middleware/authorizeVendor');

router.get('/services', authenticateToken, authorizeVendor, async (req, res) => {
  try {
    const vendorServices = await Service.find({ vendorId: req.user.id });
    res.json(vendorServices || []);
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookings', authenticateToken, authorizeVendor, async (req, res) => {
  try {
    const vendorBookings = await Booking.find({ serviceId: { $in: (await Service.distinct('_id', { vendorId: req.user.id })) } });
    res.json(vendorBookings || []);
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/services/:serviceId', authenticateToken, authorizeVendor, async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await Service.findOneAndDelete({ _id: serviceId, vendorId: req.user.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found or unauthorized' });
    }
    req.app.get('io').emit('serviceDeleted', { serviceId });
    res.json({ message: 'Service deleted successfully', service });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;