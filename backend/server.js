require('dotenv').config({ debug: true });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

// Routes
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes  = require('./routes/adminRoutes');

// Models
const User    = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// -----------------------------------------------------
// Middleware
// -----------------------------------------------------
app.use((req, _res, next) => {
  console.log(`[CORS DEBUG] ${req.method} ${req.url} from: ${req.get('Origin') || 'unknown'}`);
  next();
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// expose socket to routes
app.set('io', io);

// -----------------------------------------------------
// DB
// -----------------------------------------------------
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('[DB DEBUG] MongoDB connected'))
  .catch(err => console.error('[DB DEBUG] Mongo error:', err.message));

// -----------------------------------------------------
// Auth helpers
// -----------------------------------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('[AUTH DEBUG] Authorization header:', authHeader ? 'Present' : 'Missing');

  const token =
    authHeader?.split(' ')[1] ||
    (authHeader && !authHeader.startsWith('Bearer ') ? authHeader.trim() : null) ||
    req.query?.token ||
    null;

  if (!token) {
    console.log('[AUTH DEBUG] No token provided - returning 401');
    return res.status(401).json({ message: 'No token provided' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('[AUTH DEBUG] JWT_SECRET is missing - returning 500');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH DEBUG] Token OK:', { id: decoded.id, role: decoded.role });
    req.user = decoded;
    return next();
  } catch (e) {
    console.error('[AUTH DEBUG] Verify failed:', e.name, e.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeAdmin    = (req, res, next) => {
  console.log('[ADMIN DEBUG] Checking role for user:', req.user.role);
  return req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
};
const authorizeCustomer = (req, res, next) => {
  console.log('[CUSTOMER DEBUG] Checking role for user:', req.user.role);
  return req.user.role === 'customer' ? next() : res.status(403).json({ message: 'Customer access required' });
};
const authorizeVendor   = (req, res, next) => {
  console.log('[VENDOR DEBUG] Checking role for user:', req.user.role);
  return req.user.role === 'vendor' ? next() : res.status(403).json({ message: 'Vendor access required' });
};

// -----------------------------------------------------
// Root
// -----------------------------------------------------
app.get('/', (_req, res) => {
  res.json({ message: 'Household Services Platform API - Welcome!' });
});

// -----------------------------------------------------
// Auth
// -----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // quick admin
    if (email === 'admin@example.com' && password === 'admin123') {
      const token = jwt.sign({ id: 'admin-id', role: 'admin', email }, process.env.JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, role: 'admin' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), String(user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, name, phone, location } = req.body;
  try {
    if (!email || !password || !role) return res.status(400).json({ message: 'Email, password, and role are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);

    // Optional user location (GeoJSON Point). Only include if valid.
    let safeLocation;
    if (
      location &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2 &&
      location.coordinates.every(n => typeof n === 'number')
    ) {
      safeLocation = {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]], // [lng, lat]
        address: location.address || '',
      };
    }

    const user = new User({
      email,
      password: hash,
      role,
      name: name || (email ? email.split('@')[0] : 'User'),
      phone: phone || '',
      ...(safeLocation ? { location: safeLocation } : {}),
    });

    await user.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------
// Services
// -----------------------------------------------------
app.get('/api/services', authenticateToken, async (_req, res) => {
  try {
    const services = await Service.find().lean();
    console.log('Services fetched:', services.length);
    return res.json(services || []);
  } catch (error) {
    console.error('Error fetching services:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price || !description) return res.status(400).json({ message: 'Name, price, and description are required' });

    const service = new Service({ name, price, description, vendorId: req.user.id, status: 'pending' });
    await service.save();

    req.app.get('io').emit('serviceAdded', service);
    return res.status(201).json({ message: 'Service added', service });
  } catch (error) {
    console.error('Error adding service:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------
// Admin routes (mounted, no overlap)
// -----------------------------------------------------
app.use('/api/admin', authenticateToken, authorizeAdmin, adminRoutes);

// -----------------------------------------------------
// Customer routes (approved services + own bookings)
// -----------------------------------------------------
app.use('/api/customer', authenticateToken, authorizeCustomer, async (req, res) => {
  try {
    if (req.path === '/services') {
      const approved = await Service.find({ status: 'approved' })
        .populate('vendorId', 'name email phone') // show vendor contact to customers
        .lean();
      return res.json(approved || []);
    } else if (req.path === '/bookings') {
      const myBookings = await Booking.find({ customerId: req.user.id })
        .populate({
          path: 'serviceId',
          select: 'name price description vendorId',
          populate: { path: 'vendorId', select: 'name email phone' },
        })
        .lean();
      return res.json(myBookings || []);
    }
    return res.status(404).json({ message: 'Customer endpoint not found' });
  } catch (err) {
    console.error('[CUSTOMER DEBUG] Error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------
// Vendor bookings (POPULATED) — registered BEFORE vendorRoutes
// -----------------------------------------------------
app.get('/api/vendor/bookings', authenticateToken, authorizeVendor, async (req, res) => {
  try {
    const serviceIds = await Service.find({ vendorId: req.user.id }).distinct('_id');

    console.log('[VENDOR BOOKINGS] vendor:', req.user.id, 'serviceIds:', serviceIds.length);

    const bookingsForVendor = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate('serviceId', 'name price')
      .populate('customerId', 'name email phone location') // expose phone + optional user location
      .lean();

    console.log('[VENDOR BOOKINGS] results:', bookingsForVendor.length);
    return res.json(bookingsForVendor || []);
  } catch (err) {
    console.error('[VENDOR] Fetch bookings error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------
// Vendor routes (mounted AFTER to avoid shadowing /api/vendor/bookings)
// -----------------------------------------------------
app.use('/api/vendor', vendorRoutes);

// -----------------------------------------------------
// Bookings (customer list/create; vendor/customer cancel)
// -----------------------------------------------------
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.json([]); // only customers list their own
    const myBookings = await Booking.find({ customerId: req.user.id })
      .populate({
        path: 'serviceId',
        select: 'name price description vendorId',
        populate: { path: 'vendorId', select: 'name email phone' },
      })
      .lean();
    return res.json(myBookings || []);
  } catch (err) {
    console.error('Error fetching bookings:', err.name, err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create booking (captures optional customer location for this job)
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { serviceId, date, location } = req.body;
    if (!serviceId || !date) return res.status(400).json({ message: 'Service ID and date are required' });

    const service = await Service.findById(serviceId);
    if (!service || (service.status !== 'approved' && service.status !== 'pending')) {
      return res.status(400).json({ message: 'Service not available or not approved' });
    }

    let customerLocation;
    if (location && (location.address || (Array.isArray(location.coordinates) && location.coordinates.length === 2))) {
      customerLocation = {
        address: location.address || '',
        coordinates: Array.isArray(location.coordinates) && location.coordinates.length === 2
          ? [Number(location.coordinates[0]), Number(location.coordinates[1])] // [lng, lat]
          : undefined,
      };
    }

    const booking = new Booking({
      customerId: req.user.id,
      serviceId,
      date,
      status: 'pending',
      ...(customerLocation ? { customerLocation } : {}),
    });
    await booking.save();

    // global + direct vendor notification
    io.emit('bookingAdded', booking);
    io.to(service.vendorId.toString()).emit('bookingNotification', {
      message: `New booking for your service "${service.name}" on ${new Date(date).toDateString()}`,
      booking,
    });

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    console.error('Error creating booking:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (allowed to the customer who owns it OR the vendor who owns the service)
app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId', 'name vendorId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isCustomerOwner = req.user.role === 'customer' && booking.customerId.toString() === req.user.id;
    const isVendorOwner   = req.user.role === 'vendor'   && booking.serviceId?.vendorId?.toString() === req.user.id;

    if (!isCustomerOwner && !isVendorOwner) {
      return res.status(403).json({ message: 'Not allowed to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // notify the other side
    try {
      if (isCustomerOwner) {
        io.to(booking.serviceId.vendorId.toString()).emit('bookingNotification', {
          message: `Customer cancelled a booking for "${booking.serviceId.name}"`,
          booking,
        });
      } else if (isVendorOwner) {
        io.to(booking.customerId.toString()).emit('bookingNotification', {
          message: `Vendor cancelled your booking for "${booking.serviceId.name}"`,
          booking,
        });
      }
    } catch (_) {}

    return res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    console.error('Cancel booking error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------
// Socket.IO
// -----------------------------------------------------
app.use('/socket.io', (req, _res, next) => { console.log('[SOCKET DEBUG] Socket.IO path hit:', req.method, req.url); next(); });

io.on('connection', (socket) => {
  console.log('[SOCKET DEBUG] User connected:', socket.id, 'from origin:', socket.handshake.headers.origin);
  socket.on('joinRoom', (userId) => {
    socket.join(userId.toString());
    console.log('[SOCKET DEBUG] User joined room:', userId);
  });
  socket.on('disconnect', () => {
    console.log('[SOCKET DEBUG] User disconnected:', socket.id);
  });
});

// -----------------------------------------------------
// Errors / 404
// -----------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('[ERROR DEBUG] Unhandled error:', err.message);
  console.error('[ERROR DEBUG] Stack:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.use('*', (req, res) => {
  console.log('[404 DEBUG] Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// -----------------------------------------------------
// Start
// -----------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER DEBUG] Backend running on http://localhost:${PORT}`);
  console.log('[SERVER DEBUG] Environment vars loaded:', {
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    PORT: process.env.PORT || 5000,
  });
});
