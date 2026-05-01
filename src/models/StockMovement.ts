import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockMovement extends Document {
  productId: string;
  warehouseId: string;
  qty: number;
  valuationRate: number;
  referenceType: string;
  referenceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema: Schema = new Schema({
  productId: { type: String, required: true },
  warehouseId: { type: String, required: true },
  qty: { type: Number, required: true },
  valuationRate: { type: Number, required: true },
  referenceType: { type: String, required: true },
  referenceId: { type: String, required: true },
}, { timestamps: true });

const StockMovement: Model<IStockMovement> = mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);

export default StockMovement;
