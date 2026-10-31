import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, default: '' },
  category: { type: String, default: 'General' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  lowStockAt: { type: Number, default: 5 },
}, { timestamps: true });
export default mongoose.model('Item', schema);
