const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gst: { type: String },
  currency: { type: String, default: 'INR' },
  paymentTerms: { type: String },
  // NoSQL Pattern: Embedding addresses for read performance
  addresses: [{
    type: { type: String, enum: ['Billing', 'Shipping'], default: 'Shipping' },
    line1: String,
    city: String,
    state: String,
    pincode: String
  }],
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

vendorSchema.index({ name: 1, deletedAt: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
