const mongoose = require('mongoose');

// Optional GeoJSON Point sub-schema (no defaults)
const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    // [longitude, latitude]
    coordinates: { type: [Number], required: true },
    address: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    // mark password as select: false to avoid leaking it unless explicitly selected
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'customer', 'vendor'], required: true },
    name: String,
    phone: { type: String, required: false }, // keep optional to avoid blocking old accounts
    location: { type: locationSchema, required: false }, // <-- optional; only set when valid coords provided
  },
  { timestamps: true }
);

// 2dsphere index works fine even if many docs have no `location`
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
