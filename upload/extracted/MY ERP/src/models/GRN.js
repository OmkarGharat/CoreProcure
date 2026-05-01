const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
  poLineId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Crucial for updating exact PO line
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // Denormalized
  orderedQty: { type: Number, required: true }, // Denormalized for UI context
  receivedQty: { type: Number, required: true },
  acceptedQty: { type: Number, required: true }, // What actually goes to stock
  rejectedQty: { type: Number, required: true },
  rate: { type: Number, required: true }, // PO Rate
  warehouseId: { type: String, required: true }
}, { _id: true });

const grnSchema = new mongoose.Schema({
  grnNumber: { type: String, required: true, unique: true },
  poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: { type: String, required: true }, // Denormalized
  status: { 
    type: String, 
    enum: ['Draft', 'Posted'], 
    default: 'Draft' 
  },
  items: [grnItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('GRN', grnSchema);
