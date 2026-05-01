const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  description: { type: String, required: true },
  uom: { type: String, required: true },
  defaultPurchaseAccount: { type: String },
  valuationRate: { type: Number, default: 0 }, // For Moving Average Cost (Phase 3)
  stockQty: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Prevents duplicate itemCodes for active items, allows re-use if soft-deleted
productSchema.index({ itemCode: 1, deletedAt: 1 }, { 
  unique: true, 
  partialFilterExpression: { deletedAt: null } 
});

module.exports = mongoose.model('Product', productSchema);
