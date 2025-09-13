const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date:       { type: Date, required: true },
    status:     { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },

    // ✅ Optional location the customer provides at booking time
    customerLocation: {
      address: { type: String },
      // GeoJSON-like coords (NOT indexed): [lng, lat]
      coordinates: { type: [Number] }, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
