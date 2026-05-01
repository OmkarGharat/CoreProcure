import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendorPayment extends Document {
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: Date;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque';
  referenceNumber?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorPaymentSchema: Schema = new Schema({
  paymentNumber: { type: String, required: true, unique: true },
  vendorId: { type: String, required: true },
  vendorName: { type: String, required: true },
  invoiceId: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, required: true, enum: ['Cash', 'Bank Transfer', 'Cheque'] },
  referenceNumber: { type: String },
  remarks: { type: String },
}, { timestamps: true });

const VendorPayment: Model<IVendorPayment> = mongoose.models.VendorPayment || mongoose.model<IVendorPayment>('VendorPayment', VendorPaymentSchema);

export default VendorPayment;
