import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  productNumber: string;
  productCode: string;
  description: string;
  category?: string;
  isActive: boolean;
  
  // Purchase
  purchaseUom?: string;
  purchaseRate: number;
  preferredVendor?: string;
  leadTime?: number; // In days
  taxCode?: string;

  // Inventory
  stockUom: string;
  valuationRate: number;
  inventoryFlag: boolean;
  reorderLevel: number;
  qcRequired: boolean;
  lotSerialTracking?: 'None' | 'Lot' | 'Serial';
  stockQty: number;

  // Accounting
  inventoryAccount?: string;
  expenseAccount?: string;

  // Advanced
  dimensions?: string;
  weight?: string;
  brand?: string;
  alternates?: string;
  attachments?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  productNumber: { type: String, required: true, unique: true },
  productCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String },
  isActive: { type: Boolean, default: true },

  // Purchase
  purchaseUom: { type: String },
  purchaseRate: { type: Number, default: 0 },
  preferredVendor: { type: String },
  leadTime: { type: Number, default: 0 },
  taxCode: { type: String },

  // Inventory
  stockUom: { type: String, required: true },
  valuationRate: { type: Number, default: 0 },
  inventoryFlag: { type: Boolean, default: true },
  reorderLevel: { type: Number, default: 0 },
  qcRequired: { type: Boolean, default: false },
  lotSerialTracking: { type: String, default: 'None', enum: ['None', 'Lot', 'Serial'] },
  stockQty: { type: Number, default: 0 },

  // Accounting
  inventoryAccount: { type: String },
  expenseAccount: { type: String },

  // Advanced
  dimensions: { type: String },
  weight: { type: String },
  brand: { type: String },
  alternates: { type: String },
  attachments: { type: String },
}, { timestamps: true });



const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
