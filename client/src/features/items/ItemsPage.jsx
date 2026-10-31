import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { cacheItems, getCachedItems } from '../../services/db';
import { Btn, Input, Card } from '../../components/ui';
import { useAuth } from '../../app/store';
export default function ItemsPage() {
  const [search, setSearch] = useState(''); const [debounced, setDebounced] = useState(''); const [form, setForm] = useState(null);
  useEffect(() => { const t = setTimeout(() => setDebounced(search), 250); return () => clearTimeout(t); }, [search]);
  const qc = useQueryClient(); const isAdmin = useAuth((s) => s.user?.role) === 'admin';
  const { data = [], isLoading } = useQuery({ queryKey: ['items', debounced], queryFn: async () => {
    try { const { data } = await api.get('/items', { params: { search: debounced } }); cacheItems(data); return data; }
    catch { return (await getCachedItems()) || []; }
  }});
  const save = useMutation({ mutationFn: (v) => v._id ? api.put(`/items/${v._id}`, v) : api.post('/items', v), onSuccess: () => { qc.invalidateQueries({ queryKey: ['items'] }); setForm(null); } });
  const del = useMutation({ mutationFn: (id) => api.delete(`/items/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }) });
  const list = useMemo(() => data, [data]);
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Items</h1>
    <div className="flex gap-2"><Input autoFocus placeholder="Search name, barcode or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
    {isAdmin && <Btn onClick={() => setForm({ name: '', sku: '', barcode: '', category: 'General', price: 0, stock: 0, lowStockAt: 5 })}>+ New Item</Btn>}</div>
    {isLoading && <p>Loading…</p>}
    {form && <Card><form className="grid md:grid-cols-3 gap-2" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      {['name','sku','barcode','category'].map((k) => <Input key={k} placeholder={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      {['price','stock','lowStockAt'].map((k) => <Input key={k} type="number" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />)}
      <Btn>Save</Btn><button type="button" onClick={() => setForm(null)}>Cancel</button></form></Card>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{list.map((it) => <Card key={it._id}>
      <div className="flex justify-between"><b>{it.name}</b><span>{it.price.toLocaleString()}</span></div>
      <p className="text-sm text-slate-600">{it.category} · SKU {it.sku} · Barcode {it.barcode || '—'}</p>
      <p className="text-sm">Stock: {it.stock} {it.stock <= (it.lowStockAt ?? 5) && <span className="text-red-600 font-bold">⚠ Low stock</span>}</p>
      {isAdmin && <div className="flex gap-2 mt-2"><button className="underline text-sm" onClick={() => setForm(it)}>Edit</button><button className="underline text-sm text-red-600" onClick={() => del.mutate(it._id)}>Delete</button></div>}
    </Card>)}</div></div>;
}
