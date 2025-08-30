const mongoose = require('mongoose');

    const serviceSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    });

    module.exports = mongoose.model('Service', serviceSchema);
    