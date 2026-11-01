import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Btn, Input, Card, PageHeader } from '../../components/ui';
export default function CustomersPage() {
  const [search, setSearch] = useState(''); const [form, setForm] = useState(null); const [history, setHistory] = useState(null);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['customers', search], queryFn: async () => { try { const { data } = await api.get('/customers', { params: { search } }); return data; } catch { return []; } } });
  const save = useMutation({ mutationFn: (v) => v._id ? api.put(`/customers/${v._id}`, v) : api.post('/customers', v), onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setForm(null); } });
  const del = useMutation({ mutationFn: (id) => api.delete(`/customers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) });
  const loadHistory = async (c) => { const { data } = await api.get(`/customers/${c._id}/history`); setHistory({ customer: c, invoices: data }); };
  return <div className="space-y-5">
    <PageHeader title="Customers" subtitle="Customer directory and purchase history.">
      <Btn onClick={() => setForm({ name: '', phone: '', email: '', address: '' })}>+ New Customer</Btn>
    </PageHeader>
    <Input className="py-3" placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
    {form && <Card><form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      {['name','phone','email','address'].map((k) => <Input key={k} placeholder={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      <div className="flex gap-2 md:col-span-2"><Btn>Save</Btn><Btn variant="secondary" type="button" onClick={() => setForm(null)}>Cancel</Btn></div></form></Card>}
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{data.map((c) => <Card key={c._id} className="transition hover:border-indigo-200 hover:shadow-md">
      <b className="tracking-tight">{c.name}</b>
      <p className="mt-1 text-sm text-slate-500">{c.phone} · {c.email}</p>
      <p className="text-sm text-slate-500">{c.address}</p>
      <div className="mt-3 flex gap-3 text-sm font-medium"><button className="text-indigo-600 hover:text-indigo-700" onClick={() => setForm(c)}>Edit</button><button className="text-indigo-600 hover:text-indigo-700" onClick={() => loadHistory(c)}>Purchase history</button><button className="text-rose-600 hover:text-rose-700" onClick={() => del.mutate(c._id)}>Delete</button></div>
    </Card>)}</div>
    {history && <Card><h2 className="font-bold tracking-tight">History — {history.customer.name}</h2>{history.invoices.length === 0 ? <p className="mt-2 text-sm text-slate-500">No purchases yet.</p> : <div className="mt-3 divide-y divide-slate-100">{history.invoices.map((i) => <p key={i._id} className="py-2 text-sm">{i.invoiceNo} · {new Date(i.invoiceDate).toLocaleDateString()} · {i.total?.toLocaleString()}</p>)}</div>}<button className="mt-3 text-sm font-medium text-slate-600 underline" onClick={() => setHistory(null)}>Close</button></Card>}
  </div>;
}
