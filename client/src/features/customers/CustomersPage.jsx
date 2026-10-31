import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Btn, Input, Card } from '../../components/ui';
export default function CustomersPage() {
  const [search, setSearch] = useState(''); const [form, setForm] = useState(null); const [history, setHistory] = useState(null);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['customers', search], queryFn: async () => { try { const { data } = await api.get('/customers', { params: { search } }); return data; } catch { return []; } } });
  const save = useMutation({ mutationFn: (v) => v._id ? api.put(`/customers/${v._id}`, v) : api.post('/customers', v), onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setForm(null); } });
  const del = useMutation({ mutationFn: (id) => api.delete(`/customers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) });
  const loadHistory = async (c) => { const { data } = await api.get(`/customers/${c._id}/history`); setHistory({ customer: c, invoices: data }); };
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Customers</h1>
    <div className="flex gap-2"><Input placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} /><Btn onClick={() => setForm({ name: '', phone: '', email: '', address: '' })}>+ New Customer</Btn></div>
    {form && <Card><form className="grid md:grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      {['name','phone','email','address'].map((k) => <Input key={k} placeholder={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      <Btn>Save</Btn><button type="button" onClick={() => setForm(null)}>Cancel</button></form></Card>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{data.map((c) => <Card key={c._id}><b>{c.name}</b><p className="text-sm">{c.phone} · {c.email}</p><p className="text-sm">{c.address}</p>
      <div className="flex gap-2 mt-2 text-sm"><button className="underline" onClick={() => setForm(c)}>Edit</button><button className="underline" onClick={() => loadHistory(c)}>Purchase history</button><button className="underline text-red-600" onClick={() => del.mutate(c._id)}>Delete</button></div></Card>)}</div>
    {history && <Card><h2 className="font-bold">History — {history.customer.name}</h2>{history.invoices.length === 0 ? <p>No purchases yet.</p> : history.invoices.map((i) => <p key={i._id} className="text-sm">{i.invoiceNo} · {new Date(i.invoiceDate).toLocaleDateString()} · {i.total?.toLocaleString()}</p>)}<button className="underline text-sm mt-2" onClick={() => setHistory(null)}>Close</button></Card>}
  </div>;
}
