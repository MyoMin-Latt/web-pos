import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { cacheItems, getCachedItems, cacheCustomers, getCachedCustomers, addToOutbox } from '../../services/db';
import { useCart, useSync } from '../../app/store';
import { Btn, Input, Card, Select, Badge, PageHeader, Field } from '../../components/ui';
import Receipt from './Receipt';
export default function PosPage() {
  const [search, setSearch] = useState(''); const [debounced, setDebounced] = useState(''); const [receipt, setReceipt] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { const t = setTimeout(() => setDebounced(search), 200); return () => clearTimeout(t); }, [search]);
  const cart = useCart(); const setPending = useSync((s) => s.setPending);
  const { data: items = [] } = useQuery({ queryKey: ['items', debounced], queryFn: async () => { try { const { data } = await api.get('/items', { params: { search: debounced } }); if (!debounced) cacheItems(data); return data; } catch { return (await getCachedItems()) || []; } } });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: async () => { try { const { data } = await api.get('/customers'); cacheCustomers(data); return data; } catch { return (await getCachedCustomers()) || []; } } });
  const subtotal = useMemo(() => cart.lines.reduce((s, l) => s + l.price * l.qty, 0), [cart.lines]);
  const total = Math.max(0, subtotal - cart.discount + cart.tax);
  const checkout = async () => {
    if (!cart.lines.length) return;
    const payload = { customerId: cart.customer?._id || null, customerName: cart.customer?.name || 'Walk-in', items: cart.lines, discount: cart.discount, tax: cart.tax, paymentMethod: cart.paymentMethod, invoiceDate: cart.invoiceDate };
    setMsg('');
    try {
      const { data } = await api.post('/invoices', payload);
      setReceipt(data); setMsg('Sale saved to server.');
    } catch {
      // OFFLINE PATH: never lose the sale — queue it in IndexedDB for syncEngine.
      const pending = await addToOutbox(payload); setPending(pending);
      setReceipt({ ...payload, invoiceNo: `OFFLINE-${Date.now()}`, subtotal, total, invoiceDate: cart.invoiceDate });
      setMsg(`Offline: sale queued locally (${pending} pending). It will sync automatically when back online.`);
    }
    cart.clear();
  };
  const onSearchKey = (e) => { if (e.key === 'Enter' && items.length === 1) { cart.add(items[0]); setSearch(''); } };
  return <div className="grid gap-5 lg:grid-cols-3">
    <div className="space-y-4 lg:col-span-2">
      <PageHeader title="POS Register" subtitle="Scan a barcode, search by name or SKU, then add to the cart." />
      <Input autoFocus className="py-3 text-base" placeholder="Scan barcode or type name / SKU… (Enter adds the only match)" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={onSearchKey} />
      {items.length === 0 && <Card><p className="text-sm text-slate-500">No items match that search yet. Try a different name, barcode, or SKU.</p></Card>}
      <div className="grid gap-3 md:grid-cols-2">{items.map((it) => <Card key={it._id} className="transition hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <b className="text-[15px] tracking-tight">{it.name}</b>
            <p className="mt-1 text-sm text-slate-500">{it.category} · {it.sku}</p>
          </div>
          <span className="text-[15px] font-bold text-indigo-700">{it.price.toLocaleString()}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">Stock {it.stock}</span>
          {it.stock <= (it.lowStockAt ?? 5) && <Badge tone="red">Low stock</Badge>}
        </div>
        <Btn className="mt-3 w-full" variant="secondary" onClick={() => cart.add(it)}>Add to cart</Btn>
      </Card>)}</div>
    </div>
    <div className="space-y-3 no-print lg:sticky lg:top-24 lg:self-start"><Card><h2 className="text-lg font-bold tracking-tight">Cart</h2>
      {cart.lines.length === 0 ? <p className="mt-2 text-sm text-slate-500">Cart is empty. Add an item to start a sale.</p> : <div className="mt-3 divide-y divide-slate-100">{cart.lines.map((l) => <div key={l.item} className="flex items-center justify-between gap-2 py-2.5 text-sm">
        <span className="min-w-0 flex-1 truncate font-medium">{l.name}</span>
        <span className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50" onClick={() => cart.setQty(l.item, l.qty - 1)}>−</button>
          <b className="w-6 text-center">{l.qty}</b>
          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50" onClick={() => cart.setQty(l.item, l.qty + 1)}>+</button>
          <button className="ml-1 text-sm font-medium text-rose-600 hover:text-rose-700" onClick={() => cart.remove(l.item)}>Remove</button>
        </span>
        <span className="w-20 text-right font-semibold">{(l.price * l.qty).toLocaleString()}</span>
      </div>)}</div>}
      <div className="mt-4 space-y-3 text-sm">
        <Field label="Customer"><Select value={cart.customer?._id || ''} onChange={(e) => cart.setCustomer(customers.find((c) => c._id === e.target.value) || null)}><option value="">Walk-in</option>{customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select></Field>
        <Field label="Invoice date (custom)"><Input type="date" value={cart.invoiceDate} onChange={(e) => cart.setInvoiceDate(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount"><Input type="number" value={cart.discount} onChange={(e) => cart.setDiscount(e.target.value)} /></Field>
          <Field label="Tax"><Input type="number" value={cart.tax} onChange={(e) => cart.setTax(e.target.value)} /></Field>
        </div>
        <Field label="Payment"><Select value={cart.paymentMethod} onChange={(e) => cart.setPaymentMethod(e.target.value)}><option value="cash">Cash</option><option value="card">Card</option></Select></Field>
        <div className="rounded-xl bg-slate-50 p-3.5">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{subtotal.toLocaleString()}</span></div>
          <div className="mt-3 flex justify-between text-lg font-bold tracking-tight"><span>Total</span><span className="text-indigo-700">{total.toLocaleString()}</span></div>
        </div>
        <Btn className="w-full py-3 text-base" disabled={!cart.lines.length} onClick={checkout}>Checkout</Btn>
        {msg && <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{msg}</p>}
      </div></Card></div>
    {receipt && <div className="lg:col-span-3"><Receipt invoice={receipt} /><div className="mt-4 text-center no-print"><Btn onClick={() => window.print()}>Print Receipt</Btn> <button className="ml-3 text-sm font-medium text-slate-600 underline" onClick={() => setReceipt(null)}>Close</button></div></div>}
  </div>;
}
