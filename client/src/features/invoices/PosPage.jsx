import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { cacheItems, getCachedItems, cacheCustomers, getCachedCustomers, addToOutbox } from '../../services/db';
import { useCart, useSync } from '../../app/store';
import { Btn, Input, Card } from '../../components/ui';
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
  return <div className="grid lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 space-y-3">
      <h1 className="text-2xl font-bold">POS Register</h1>
      <Input autoFocus placeholder="Scan barcode or type name / SKU… (Enter adds the only match)" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={onSearchKey} />
      <div className="grid md:grid-cols-2 gap-3">{items.map((it) => <Card key={it._id}><div className="flex justify-between"><b>{it.name}</b><span>{it.price.toLocaleString()}</span></div><p className="text-sm text-slate-600">{it.category} · {it.sku} · Stock {it.stock} {it.stock <= (it.lowStockAt ?? 5) && <span className="text-red-600">⚠ Low</span>}</p><Btn className="mt-2" onClick={() => cart.add(it)}>Add to cart</Btn></Card>)}</div>
    </div>
    <div className="space-y-3 no-print"><Card><h2 className="font-bold mb-2">Cart</h2>
      {cart.lines.length === 0 ? <p className="text-sm">Cart is empty.</p> : cart.lines.map((l) => <div key={l.item} className="flex justify-between items-center py-1 text-sm"><span>{l.name}</span><span className="flex gap-1 items-center"><button onClick={() => cart.setQty(l.item, l.qty - 1)}>−</button><b>{l.qty}</b><button onClick={() => cart.setQty(l.item, l.qty + 1)}>+</button><button className="text-red-600 ml-2" onClick={() => cart.remove(l.item)}>✕</button></span><span>{(l.price * l.qty).toLocaleString()}</span></div>)}
      <div className="space-y-2 mt-3 text-sm">
        <label>Customer <select className="border rounded px-2 py-2 w-full" value={cart.customer?._id || ''} onChange={(e) => cart.setCustomer(customers.find((c) => c._id === e.target.value) || null)}><option value="">Walk-in</option>{customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
        <label>Invoice date (custom) <Input type="date" value={cart.invoiceDate} onChange={(e) => cart.setInvoiceDate(e.target.value)} /></label>
        <label>Discount <Input type="number" value={cart.discount} onChange={(e) => cart.setDiscount(e.target.value)} /></label>
        <label>Tax <Input type="number" value={cart.tax} onChange={(e) => cart.setTax(e.target.value)} /></label>
        <label>Payment <select className="border rounded px-2 py-2 w-full" value={cart.paymentMethod} onChange={(e) => cart.setPaymentMethod(e.target.value)}><option value="cash">Cash</option><option value="card">Card</option></select></label>
        <div className="flex justify-between font-bold"><span>Total</span><span>{total.toLocaleString()}</span></div>
        <Btn className="w-full" disabled={!cart.lines.length} onClick={checkout}>Checkout</Btn>
        {msg && <p className="text-sm">{msg}</p>}
      </div></Card></div>
    {receipt && <div className="lg:col-span-3"><Receipt invoice={receipt} /><div className="text-center mt-3 no-print"><Btn onClick={() => window.print()}>Print Receipt</Btn> <button className="underline text-sm ml-2" onClick={() => setReceipt(null)}>Close</button></div></div>}
  </div>;
}
