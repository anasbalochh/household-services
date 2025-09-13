const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');

router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({ status: 'approved' }).populate('vendorId', 'name');
    res.json(services || []);
  } catch (error) {
    console.error('Error fetching services for customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id }).populate('serviceId', 'name price');
    res.json(bookings || []);
  } catch (error) {
    console.error('Error fetching bookings for customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const { serviceId, date } = req.body;
    if (!serviceId || !date) return res.status(400).json({ message: 'Service ID and date are required' });
    const booking = new Booking({ customerId: req.user.id, serviceId, date, status: 'pending' });
    await booking.save();
    req.app.get('io').emit('bookingAdded', booking);
    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;