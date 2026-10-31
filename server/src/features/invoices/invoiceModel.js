import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  name: String, sku: String, price: Number, qty: Number,
}, { _id: false });
const schema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName: { type: String, default: 'Walk-in' },
  items: [itemSchema],
  subtotal: Number, discount: { type: Number, default: 0 }, tax: { type: Number, default: 0 },
  total: Number, paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
  invoiceDate: { type: Date, default: Date.now },
  cashier: { type: String, default: '' },
  source: { type: String, enum: ['online', 'offline-sync'], default: 'online' },
}, { timestamps: true });
export default mongoose.model('Invoice', schema);
