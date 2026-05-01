import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendorInvoice extends Document {
  invoiceNumber: string;
  externalInvoiceNumber: string;
  grnId?: string;
  qiId?: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted' | 'Partially Paid' | 'Paid';
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  balanceAmount: number;
  dueDate?: Date;
  items: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

const VendorInvoiceSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  externalInvoiceNumber: { type: String, required: true },
  grnId: { type: String },
  qiId: { type: String },
  vendorId: { type: String, required: true },
  vendorName: { type: String, required: true },
  status: { type: String, default: 'Draft', enum: ['Draft', 'Submitted', 'Partially Paid', 'Paid'] },
  totalAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  items: { type: String, default: '[]' },
}, { timestamps: true });

const VendorInvoice: Model<IVendorInvoice> = mongoose.models.VendorInvoice || mongoose.model<IVendorInvoice>('VendorInvoice', VendorInvoiceSchema);

export default VendorInvoice;
