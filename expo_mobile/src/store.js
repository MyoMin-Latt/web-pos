import { create } from 'zustand';
import { setToken, setUser, clearAuth, getToken, getUser } from './services/storage';

// Same store shapes as the web app (web/src/app/store.js).
export const useAuth = create((set) => ({
  user: null,
  token: null,
  setAuth: async (user, token) => {
    await setUser(user);
    await setToken(token);
    set({ user, token });
  },
  logout: async () => {
    await clearAuth();
    set({ user: null, token: null });
  },
  restore: async () => {
    const [user, token] = await Promise.all([getUser(), getToken()]);
    if (user && token) set({ user, token });
  },
}));

// Barcode handed from the Scan screen back to the POS screen.
export const useScan = create((set) => ({
  barcode: null,
  setBarcode: (barcode) => set({ barcode }),
  clear: () => set({ barcode: null }),
}));

export const useSync = create((set) => ({
  pending: 0,
  lastSync: null,
  setPending: (pending) => set({ pending }),
  setLastSync: (lastSync) => set({ lastSync }),
}));

export const useCart = create((set, get) => ({
  lines: [],
  customer: null,
  discount: 0,
  tax: 0,
  paymentMethod: 'cash',
  invoiceDate: new Date().toISOString().slice(0, 10),
  add: (item) =>
    set({
      lines: get().lines.find((l) => l.item === item._id)
        ? get().lines.map((l) => (l.item === item._id ? { ...l, qty: l.qty + 1 } : l))
        : [...get().lines, { item: item._id, name: item.name, sku: item.sku, price: item.price, qty: 1 }],
    }),
  remove: (id) => set({ lines: get().lines.filter((l) => l.item !== id) }),
  setQty: (id, qty) =>
    set({
      lines:
        qty <= 0
          ? get().lines.filter((l) => l.item !== id)
          : get().lines.map((l) => (l.item === id ? { ...l, qty } : l)),
    }),
  setCustomer: (customer) => set({ customer }),
  setDiscount: (discount) => set({ discount: Number(discount) || 0 }),
  setTax: (tax) => set({ tax: Number(tax) || 0 }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setInvoiceDate: (invoiceDate) => set({ invoiceDate }),
  clear: () => set({ lines: [], customer: null, discount: 0, tax: 0, paymentMethod: 'cash' }),
}));
