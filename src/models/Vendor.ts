import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  gst?: string;
  currency: string;
  paymentTerms?: string;
  addresses: string; // JSON string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  gst: { type: String },
  currency: { type: String, default: 'INR' },
  paymentTerms: { type: String },
  addresses: { type: String, default: '[]' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
