const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // Denormalized for historical accuracy
  uom: { type: String, required: true },        // Denormalized
  qty: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  receivedQty: { type: Number, default: 0 },    // Crucial for Phase 3 (GRN)
}, { _id: true }); // Need _id for line items to update them individually later

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: { type: String, required: true }, // Denormalized
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Partially Received', 'Closed'],
    default: 'Draft' 
  },
  items: [poItemSchema], // Embedded Array Pattern
}, { timestamps: true });

purchaseOrderSchema.index({ vendorId: 1, status: 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
