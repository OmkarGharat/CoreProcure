const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: String, required: true }, // Kept as String for simplicity, can be ObjectId
  qty: { type: Number, required: true }, // Positive for IN, Negative for OUT
  valuationRate: { type: Number, required: true }, // The rate at which this specific movement was valued
  referenceType: { type: String, enum: ['GRN', 'Sales', 'Adjustment'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to GRN._id
}, { timestamps: true });

stockMovementSchema.index({ productId: 1, warehouseId: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
