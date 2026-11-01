import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../app/store';
import { Btn, Input, Card } from '../../components/ui';
export default function LoginPage() {
  const [email, setEmail] = useState('admin@pos.local'); const [password, setPassword] = useState('Admin123!'); const [err, setErr] = useState('');
  const nav = useNavigate(); const setAuth = useAuth((s) => s.setAuth);
  const submit = async (e) => { e.preventDefault(); setErr(''); try { const { data } = await api.post('/users/login', { email, password }); setAuth(data.user, data.token); nav('/'); } catch (ex) { setErr(ex.response?.data?.message || 'Login failed — is the server running on :5031?'); } };
  return <div className="mx-auto mt-10 max-w-md sm:mt-16">
    <div className="mb-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/30">W</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Web POS</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to open the register.</p>
    </div>
    <Card><h2 className="mb-4 text-lg font-bold tracking-tight">Staff Login</h2>
      <form onSubmit={submit} className="space-y-3"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />{err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}<Btn className="w-full py-3">Login</Btn></form>
      <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">Demo: admin@pos.local / Admin123! · cashier@pos.local / Cashier123!</p>
      <p className="mt-3 text-sm"><Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/register">Create an account</Link></p>
    </Card>
  </div>;
}
