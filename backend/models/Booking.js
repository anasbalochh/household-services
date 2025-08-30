const mongoose = require('mongoose');

    const bookingSchema = new mongoose.Schema({
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
    });

    module.exports = mongoose.model('Booking', bookingSchema);