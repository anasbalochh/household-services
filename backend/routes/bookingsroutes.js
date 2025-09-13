const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const authenticateToken = require('../Middleware/authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id }).populate('serviceId', 'name price vendorId status');
    res.json(bookings || []);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { serviceId, date } = req.body;
    if (!serviceId || !date) return res.status(400).json({ message: 'Service ID and date are required' });
    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'approved') return res.status(400).json({ message: 'Service not available or not approved' });
    const booking = new Booking({ customerId: req.user.id, serviceId, date, status: 'pending' });
    await booking.save();
    req.app.get('io').emit('bookingAdded', { booking, message: 'New booking created' });

    const customer = await User.findById(req.user.id).select('phone name');
    const vendor = await User.findById(service.vendorId).select('phone name');
    const customerPhone = customer.phone || 'Not provided';
    const vendorPhone = vendor.phone || 'Not provided';
    const customerName = customer.name || 'Customer';
    const vendorName = vendor.name || 'Vendor';

    req.app.get('io').to(vendor.id.toString()).emit('bookingNotification', {
      message: `New booking from ${customerName} for ${service.name}`,
      booking,
      customerPhone,
    });
    req.app.get('io').to(req.user.id.toString()).emit('bookingNotification', {
      message: `Your booking for ${service.name} with ${vendorName} is pending`,
      booking,
      vendorPhone,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true }).populate('serviceId', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    req.app.get('io').to(booking.customerId.toString()).emit('bookingStatusUpdated', {
      message: `Your booking for ${booking.serviceId.name} is now ${status}`,
      booking,
      status,
    });
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;