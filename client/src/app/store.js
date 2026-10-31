import { create } from 'zustand';
export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'), token: localStorage.getItem('pos_token'),
  setAuth: (user, token) => { localStorage.setItem('pos_user', JSON.stringify(user)); localStorage.setItem('pos_token', token); set({ user, token }); },
  logout: () => { localStorage.removeItem('pos_user'); localStorage.removeItem('pos_token'); set({ user: null, token: null }); },
}));
export const useSync = create((set) => ({ online: navigator.onLine, pending: 0, lastSync: null, setOnline: (online) => set({ online }), setPending: (pending) => set({ pending }), setLastSync: (lastSync) => set({ lastSync }) }));
export const useCart = create((set, get) => ({
  lines: [], customer: null, discount: 0, tax: 0, paymentMethod: 'cash', invoiceDate: new Date().toISOString().slice(0, 10),
  add: (item) => set({ lines: get().lines.find((l) => l.item === item._id) ? get().lines.map((l) => l.item === item._id ? { ...l, qty: l.qty + 1 } : l) : [...get().lines, { item: item._id, name: item.name, sku: item.sku, price: item.price, qty: 1 }] }),
  remove: (id) => set({ lines: get().lines.filter((l) => l.item !== id) }),
  setQty: (id, qty) => set({ lines: qty <= 0 ? get().lines.filter((l) => l.item !== id) : get().lines.map((l) => l.item === id ? { ...l, qty } : l) }),
  setCustomer: (customer) => set({ customer }), setDiscount: (discount) => set({ discount: Number(discount) || 0 }), setTax: (tax) => set({ tax: Number(tax) || 0 }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }), setInvoiceDate: (invoiceDate) => set({ invoiceDate }),
  clear: () => set({ lines: [], customer: null, discount: 0, tax: 0, paymentMethod: 'cash' }),
}));
