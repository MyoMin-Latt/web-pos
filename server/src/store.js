// DEMO in-memory fallback, used ONLY when MongoDB is unreachable.
// Labelled everywhere it surfaces (health.mode === 'demo-memory').
import bcrypt from 'bcryptjs';
const hash = (p) => bcrypt.hashSync(p, 10);
let n = 1000;
export const memory = {
  users: [
    { _id: 'u-admin', name: 'Demo Admin', email: 'admin@pos.local', passwordHash: hash('Admin123!'), role: 'admin' },
    { _id: 'u-cashier', name: 'Demo Cashier', email: 'cashier@pos.local', passwordHash: hash('Cashier123!'), role: 'cashier' },
  ],
  items: [
    { _id: 'i1', name: 'Rice 5kg', sku: 'RICE-5KG', barcode: '890100001', category: 'Rice', price: 12500, stock: 42, lowStockAt: 5 },
    { _id: 'i2', name: 'Rice 25kg', sku: 'RICE-25KG', barcode: '890100002', category: 'Rice', price: 58000, stock: 18, lowStockAt: 5 },
    { _id: 'i3', name: 'Urea Fertilizer 50kg', sku: 'FERT-UREA50', barcode: '890100003', category: 'Fertilizer', price: 95000, stock: 30, lowStockAt: 5 },
    { _id: 'i4', name: 'NPK Fertilizer 50kg', sku: 'FERT-NPK50', barcode: '890100004', category: 'Fertilizer', price: 110000, stock: 3, lowStockAt: 5 },
    { _id: 'i5', name: 'Pesticide 1L', sku: 'MED-PEST1L', barcode: '890100005', category: 'Medicine', price: 18000, stock: 25, lowStockAt: 5 },
    { _id: 'i6', name: 'Herbicide 1L', sku: 'MED-HERB1L', barcode: '890100006', category: 'Medicine', price: 22000, stock: 2, lowStockAt: 5 },
    { _id: 'i7', name: 'Cooking Oil 5L', sku: 'OIL-5L', barcode: '890100007', category: 'Grocery', price: 24000, stock: 20, lowStockAt: 5 },
    { _id: 'i8', name: 'Sugar 1kg', sku: 'SUGAR-1KG', barcode: '890100008', category: 'Grocery', price: 3200, stock: 60, lowStockAt: 10 },
    { _id: 'i9', name: 'Salt 1kg', sku: 'SALT-1KG', barcode: '890100009', category: 'Grocery', price: 1200, stock: 80, lowStockAt: 10 },
    { _id: 'i10', name: 'Soap Bar', sku: 'SOAP-BAR', barcode: '890100010', category: 'Grocery', price: 1500, stock: 4, lowStockAt: 5 },
    { _id: 'i11', name: 'Noodles Pack x5', sku: 'NOODLE-5PK', barcode: '890100011', category: 'Grocery', price: 4500, stock: 35, lowStockAt: 5 },
    { _id: 'i12', name: 'Tea Leaves 500g', sku: 'TEA-500G', barcode: '890100012', category: 'Grocery', price: 8500, stock: 15, lowStockAt: 5 },
  ],
  customers: [
    { _id: 'c1', name: 'Aung Min', phone: '0912345678', email: '', address: 'Yangon' },
    { _id: 'c2', name: 'Hla Hla', phone: '0923456789', email: '', address: 'Mandalay' },
    { _id: 'c3', name: 'Ko Ko', phone: '0934567890', email: '', address: 'Naypyidaw' },
    { _id: 'c4', name: 'Mya Mya', phone: '0945678901', email: '', address: 'Bago' },
    { _id: 'c5', name: 'Zaw Zaw', phone: '0956789012', email: '', address: 'Sagaing' },
  ],
  invoices: [],
};
export function nextId(prefix) { return `${prefix}-${Date.now()}-${(n += 1)}`; }
export function nextInvoiceNo() { return `INV-${String(memory.invoices.length + 1).padStart(5, '0')}`; }
