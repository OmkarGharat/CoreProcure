import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  productNumber: string;
  productCode: string;
  description: string;
  uom: string;
  defaultPurchaseAccount?: string;
  valuationRate: number;
  stockQty: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  productNumber: { type: String, required: true, unique: true },
  productCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  uom: { type: String, required: true },
  defaultPurchaseAccount: { type: String },
  valuationRate: { type: Number, default: 0 },
  stockQty: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
