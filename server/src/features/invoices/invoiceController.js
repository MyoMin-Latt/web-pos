import Invoice from './invoiceModel.js';
import Item from '../items/itemModel.js';
import { isDbReady } from '../../config/db.js';
import { memory, nextId, nextInvoiceNo } from '../../store.js';
export async function listInvoices(req, res) {
  if (isDbReady()) return res.json(await Invoice.find().sort({ invoiceDate: -1 }).limit(200));
  res.json([...memory.invoices].reverse());
}
export async function createInvoice(req, res) {
  const { customerId, customerName, items = [], discount = 0, tax = 0, paymentMethod = 'cash', invoiceDate, source = 'online' } = req.body;
  if (!items.length) return res.status(400).json({ message: 'Invoice needs at least one item' });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount + tax);
  if (isDbReady()) {
    const count = await Invoice.countDocuments();
    const inv = await Invoice.create({ invoiceNo: `INV-${String(count + 1).padStart(5, '0')}`, customer: customerId || null, customerName: customerName || 'Walk-in', items, subtotal, discount, tax, total, paymentMethod, invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(), cashier: req.user?.name || '', source });
    for (const line of items) { if (line.item) await Item.findByIdAndUpdate(line.item, { $inc: { stock: -line.qty } }); }
    return res.status(201).json(inv);
  }
  const inv = { _id: nextId('inv'), invoiceNo: nextInvoiceNo(), customer: customerId || null, customerName: customerName || 'Walk-in', items, subtotal, discount, tax, total, paymentMethod, invoiceDate: invoiceDate || new Date().toISOString(), cashier: req.user?.name || '', source, createdAt: new Date().toISOString() };
  memory.invoices.push(inv);
  for (const line of items) { const it = memory.items.find((x) => x._id === line.item || x.sku === line.sku); if (it) it.stock = Math.max(0, it.stock - line.qty); }
  res.status(201).json(inv);
}
export async function getInvoice(req, res) {
  if (isDbReady()) { const inv = await Invoice.findById(req.params.id); return inv ? res.json(inv) : res.status(404).json({ message: 'Invoice not found' }); }
  const inv = memory.invoices.find((i) => i._id === req.params.id); return inv ? res.json(inv) : res.status(404).json({ message: 'Invoice not found' });
}
