import Item from './itemModel.js';
import { isDbReady } from '../../config/db.js';
import { memory, nextId } from '../../store.js';
const q = (req) => (req.query.search || '').toLowerCase();
export async function listItems(req, res) {
  if (isDbReady()) {
    const s = q(req);
    const filter = s ? { $or: [{ name: new RegExp(s, 'i') }, { barcode: new RegExp(s, 'i') }, { sku: new RegExp(s, 'i') }] } : {};
    return res.json(await Item.find(filter).sort({ name: 1 }));
  }
  const s = q(req);
  res.json(memory.items.filter((i) => !s || [i.name, i.barcode, i.sku].join(' ').toLowerCase().includes(s)));
}
export async function createItem(req, res) {
  if (isDbReady()) return res.status(201).json(await Item.create(req.body));
  const item = { _id: nextId('i'), lowStockAt: 5, ...req.body }; memory.items.push(item); res.status(201).json(item);
}
export async function updateItem(req, res) {
  if (isDbReady()) { const it = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); return it ? res.json(it) : res.status(404).json({ message: 'Item not found' }); }
  const it = memory.items.find((i) => i._id === req.params.id); if (!it) return res.status(404).json({ message: 'Item not found' });
  Object.assign(it, req.body); res.json(it);
}
export async function deleteItem(req, res) {
  if (isDbReady()) { await Item.findByIdAndDelete(req.params.id); return res.json({ ok: true }); }
  memory.items = memory.items.filter((i) => i._id !== req.params.id); res.json({ ok: true });
}
