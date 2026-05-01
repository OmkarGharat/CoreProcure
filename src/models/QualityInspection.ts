import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQIItem {
  productId: string;
  productName: string;
  receivedQty: number;
  inspectedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  remarks?: string;
}

export interface IQI extends Document {
  qiNumber: string;
  grnId: string;
  grnNumber: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted';
  items: string; // JSON string of IQIItem[]
  inspectedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QISchema: Schema = new Schema({
  qiNumber: { type: String, required: true, unique: true },
  grnId: { type: String, required: true },
  grnNumber: { type: String, required: true },
  vendorId: { type: String, required: true },
  vendorName: { type: String, required: true },
  status: { type: String, default: 'Draft', enum: ['Draft', 'Submitted'] },
  items: { type: String, default: '[]' },
  inspectedBy: { type: String },
}, { timestamps: true });

const QualityInspection: Model<IQI> = mongoose.models.QualityInspection || mongoose.model<IQI>('QualityInspection', QISchema);

export default QualityInspection;
