// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // ⛔️ IMPORTANT: remove the custom _id:String requirement.
    // Let Mongoose create the default ObjectId _id
  },
  { timestamps: true }
);

// helpful indexes
serviceSchema.index({ vendorId: 1, createdAt: -1 });
serviceSchema.index({ status: 1 });

serviceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
  },
});

module.exports = mongoose.model('Service', serviceSchema);
