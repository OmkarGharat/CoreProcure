const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  prefix: { type: String, required: true },
  currentNumber: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Atomic increment to prevent duplicate numbers in distributed environments
seriesSchema.statics.getNextNumber = async function (name, prefix) {
  const series = await this.findOneAndUpdate(
    { name },
    { $inc: { currentNumber: 1 }, $set: { prefix: prefix } }, // Update prefix to match current year
    { new: true, upsert: true }
  );
  const paddedNumber = String(series.currentNumber).padStart(5, '0');
  return `${prefix}${paddedNumber}`;
};

module.exports = mongoose.model('Series', seriesSchema);