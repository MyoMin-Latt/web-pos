import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../app/store';
import { Btn, Input, Card, Select } from '../../components/ui';
export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier' }); const [err, setErr] = useState('');
  const nav = useNavigate(); const setAuth = useAuth((s) => s.setAuth);
  const submit = async (e) => { e.preventDefault(); try { const { data } = await api.post('/users/register', form); setAuth(data.user, data.token); nav('/'); } catch (ex) { setErr(ex.response?.data?.message || 'Registration failed'); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return <div className="mx-auto mt-10 max-w-md sm:mt-16"><Card><h1 className="mb-4 text-xl font-bold tracking-tight">Register Staff</h1><form onSubmit={submit} className="space-y-3">
    <Input value={form.name} onChange={set('name')} placeholder="Name" /><Input value={form.email} onChange={set('email')} placeholder="Email" /><Input type="password" value={form.password} onChange={set('password')} placeholder="Password" />
    <Select value={form.role} onChange={set('role')}><option value="cashier">Cashier</option><option value="admin">Admin</option></Select>
    {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}<Btn className="w-full py-3">Register</Btn></form>
    <p className="mt-3 text-sm"><Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/login">Back to login</Link></p></Card></div>;
}
