const express = require('express');
const router = express.Router();
const authenticateToken = require('../iddleware/authenticateToken');
const Service = require('../models/Service');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find({ vendorId: req.user.id }).populate('vendorId', 'name');
    console.log('Services fetched for vendor:', services.length);
    res.json(services || []);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price || !description) return res.status(400).json({ message: 'Name, price, and description are required' });
    const service = new Service({ name, price, description, vendorId: req.user.id, status: 'pending' });
    await service.save();
    req.app.get('io').emit('serviceAdded', { service, message: 'New service added' });
    res.status(201).json({ message: 'Service added', service });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndUpdate({ _id: id }, { status: 'approved' }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    req.app.get('io').emit('serviceApproved', { service, message: 'Service approved' });
    res.json({ message: 'Service approved', service });
  } catch (error) {
    console.error('Error approving service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndDelete({ _id: id, vendorId: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found or unauthorized' });
    req.app.get('io').emit('serviceDeleted', { id, message: 'Service deleted' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;