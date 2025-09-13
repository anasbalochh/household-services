// routes/adminRoutes.js
const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const router = express.Router();

/**
 * GET /api/admin/analytics
 * Cards on the Analytics tab
 */
router.get('/analytics', async (_req, res) => {
  try {
    const [totalUsers, totalServices, totalBookings] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
    ]);
    // Placeholder revenue (your MVP logic)
    const totalRevenue = totalBookings * 100;
    return res.json({ totalUsers, totalServices, totalBookings, totalRevenue });
  } catch (err) {
    console.error('[ADMIN] Analytics error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/users
 * Users tab (no passwords)
 */
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt').lean();
    // Ensure a displayable name
    const safe = users.map(u => ({
      ...u,
      name: u.name || (u.email ? u.email.split('@')[0] : 'User'),
    }));
    return res.json(safe);
  } catch (err) {
    console.error('[ADMIN] Users fetch error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Inline edit from Users tab (name/email/role only)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (role !== undefined) update.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
      fields: 'name email role createdAt',
    }).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[ADMIN] Update user error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete from Users tab
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('[ADMIN] Delete user error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/services
 * Services tab (populate vendor)
 */
router.get('/services', async (_req, res) => {
  try {
    const services = await Service.find()
      .populate('vendorId', 'name email')
      .lean();
    return res.json(services);
  } catch (err) {
    console.error('[ADMIN] Services fetch error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/services/:id
 * Inline edit from Services tab (name/price/description/status)
 */
router.put('/services/:id', async (req, res) => {
  try {
    const { name, price, description, status } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;

    const service = await Service.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('vendorId', 'name email')
      .lean();

    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  } catch (err) {
    console.error('[ADMIN] Update service error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/services/:id
 * Delete from Services tab
 */
router.delete('/services/:id', async (req, res) => {
  try {
    const doc = await Service.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Service not found' });
    return res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('[ADMIN] Delete service error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/services/:id/approve
 * Approve a service (emits vendor notification)
 */
router.put('/services/:id/approve', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).lean();

    if (!service) return res.status(404).json({ message: 'Service not found' });

    // 🔔 Notify vendor about approval
    try {
      const io = req.app.get('io');
      if (io && service.vendorId) {
        io.to(service.vendorId.toString()).emit('serviceNotification', {
          message: `Your service "${service.name}" was approved`,
          service,
        });
      }
    } catch (_) { /* ignore socket errors */ }

    return res.json(service);
  } catch (err) {
    console.error('[ADMIN] Approve service error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/bookings
 * Bookings tab (populate customer & service)
 */
router.get('/bookings', async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('serviceId', 'name price description')
      .lean();
    return res.json(bookings);
  } catch (err) {
    console.error('[ADMIN] Bookings fetch error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/bookings/:id
 * Update a booking (status/date). Emits customer notification.
 */
router.put('/bookings/:id', async (req, res) => {
  try {
    const { status, date } = req.body || {};
    const update = {};
    if (status !== undefined) update.status = status;
    if (date !== undefined) update.date = date;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name email')
      .populate('serviceId', 'name')
      .lean();

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // 🔔 Notify customer about status change
    try {
      const io = req.app.get('io');
      if (io && booking.customerId) {
        io.to(booking.customerId._id.toString()).emit('bookingNotification', {
          message: `Your booking for "${booking.serviceId?.name || 'a service'}" is now "${booking.status}"`,
          booking,
        });
      }
    } catch (_) { /* ignore socket errors */ }

    return res.json(booking);
  } catch (err) {
    console.error('[ADMIN] Update booking error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/bookings/:id
 * Delete from Bookings tab
 */
router.delete('/bookings/:id', async (req, res) => {
  try {
    const doc = await Booking.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('[ADMIN] Delete booking error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
