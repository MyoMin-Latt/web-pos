import Customer from './customerModel.js';
import Invoice from '../invoices/invoiceModel.js';
import { isDbReady } from '../../config/db.js';
import { memory, nextId } from '../../store.js';
export async function listCustomers(req, res) {
  const s = (req.query.search || '').toLowerCase();
  if (isDbReady()) {
    const filter = s ? { $or: [{ name: new RegExp(s, 'i') }, { phone: new RegExp(s, 'i') }] } : {};
    return res.json(await Customer.find(filter).sort({ name: 1 }));
  }
  res.json(memory.customers.filter((c) => !s || `${c.name} ${c.phone}`.toLowerCase().includes(s)));
}
export async function createCustomer(req, res) {
  if (isDbReady()) return res.status(201).json(await Customer.create(req.body));
  const c = { _id: nextId('c'), ...req.body }; memory.customers.push(c); res.status(201).json(c);
}
export async function updateCustomer(req, res) {
  if (isDbReady()) { const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }); return c ? res.json(c) : res.status(404).json({ message: 'Customer not found' }); }
  const c = memory.customers.find((x) => x._id === req.params.id); if (!c) return res.status(404).json({ message: 'Customer not found' });
  Object.assign(c, req.body); res.json(c);
}
export async function deleteCustomer(req, res) {
  if (isDbReady()) { await Customer.findByIdAndDelete(req.params.id); return res.json({ ok: true }); }
  memory.customers = memory.customers.filter((x) => x._id !== req.params.id); res.json({ ok: true });
}
export async function customerHistory(req, res) {
  if (isDbReady()) return res.json(await Invoice.find({ customer: req.params.id }).sort({ invoiceDate: -1 }));
  res.json(memory.invoices.filter((i) => i.customer === req.params.id));
}
