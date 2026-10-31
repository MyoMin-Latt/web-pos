import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { cacheItems, getCachedItems } from '../../services/db';
import { Btn, Input, Card, Badge, PageHeader } from '../../components/ui';
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
  return <div className="space-y-5">
    <PageHeader title="Items" subtitle="Inventory, prices, and stock levels — search by name, barcode, or SKU.">
      {isAdmin && <Btn onClick={() => setForm({ name: '', sku: '', barcode: '', category: 'General', price: 0, stock: 0, lowStockAt: 5 })}>+ New Item</Btn>}
    </PageHeader>
    <Input autoFocus className="py-3" placeholder="Search name, barcode or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
    {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
    {form && <Card><form className="grid gap-3 md:grid-cols-3" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      {['name','sku','barcode','category'].map((k) => <Input key={k} placeholder={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      {['price','stock','lowStockAt'].map((k) => <Input key={k} type="number" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />)}
      <div className="flex gap-2 md:col-span-3"><Btn>Save</Btn><Btn variant="secondary" type="button" onClick={() => setForm(null)}>Cancel</Btn></div></form></Card>}
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{list.map((it) => <Card key={it._id} className="transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3"><b className="tracking-tight">{it.name}</b><span className="font-bold text-indigo-700">{it.price.toLocaleString()}</span></div>
      <p className="mt-1 text-sm text-slate-500">{it.category} · SKU {it.sku} · Barcode {it.barcode || '—'}</p>
      <p className="mt-3 flex items-center gap-2 text-sm"><span className="text-slate-500">Stock: {it.stock}</span>{it.stock <= (it.lowStockAt ?? 5) && <Badge tone="red">Low stock</Badge>}</p>
      {isAdmin && <div className="mt-3 flex gap-3 text-sm font-medium"><button className="text-indigo-600 hover:text-indigo-700" onClick={() => setForm(it)}>Edit</button><button className="text-rose-600 hover:text-rose-700" onClick={() => del.mutate(it._id)}>Delete</button></div>}
    </Card>)}</div>
    {!isLoading && list.length === 0 && <Card><p className="text-sm text-slate-500">No items found.</p></Card>}
  </div>;
}
