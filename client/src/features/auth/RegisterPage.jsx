import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../app/store';
import { Btn, Input, Card } from '../../components/ui';
export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier' }); const [err, setErr] = useState('');
  const nav = useNavigate(); const setAuth = useAuth((s) => s.setAuth);
  const submit = async (e) => { e.preventDefault(); try { const { data } = await api.post('/users/register', form); setAuth(data.user, data.token); nav('/'); } catch (ex) { setErr(ex.response?.data?.message || 'Registration failed'); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return <div className="max-w-md mx-auto mt-16"><Card><h1 className="text-xl font-bold mb-4">Register Staff</h1><form onSubmit={submit} className="space-y-3">
    <Input value={form.name} onChange={set('name')} placeholder="Name" /><Input value={form.email} onChange={set('email')} placeholder="Email" /><Input type="password" value={form.password} onChange={set('password')} placeholder="Password" />
    <select className="border rounded px-2 py-2 w-full" value={form.role} onChange={set('role')}><option value="cashier">Cashier</option><option value="admin">Admin</option></select>
    {err && <p className="text-red-600 text-sm">{err}</p>}<Btn className="w-full">Register</Btn></form></Card></div>;
}
