import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGRN extends Document {
  grnNumber: string;
  poId: string;
  vendorId: string;
  vendorName: string;
  status: string;
  items: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

const GRNSchema: Schema = new Schema({
  grnNumber: { type: String, required: true, unique: true },
  poId: { type: String, required: true },
  vendorId: { type: String, required: true },
  vendorName: { type: String, required: true },
  status: { type: String, default: 'Draft' },
  items: { type: String, default: '[]' },
}, { timestamps: true });

const GRN: Model<IGRN> = mongoose.models.GRN || mongoose.model<IGRN>('GRN', GRNSchema);

export default GRN;
