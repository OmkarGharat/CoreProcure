import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeries extends Document {
  name: string;
  prefix: string;
  currentNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const SeriesSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  prefix: { type: String, required: true },
  currentNumber: { type: Number, default: 0 },
}, { timestamps: true });

const Series: Model<ISeries> = mongoose.models.Series || mongoose.model<ISeries>('Series', SeriesSchema);

export default Series;
