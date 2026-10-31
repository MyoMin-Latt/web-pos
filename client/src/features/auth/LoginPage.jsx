import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../app/store';
import { Btn, Input, Card } from '../../components/ui';
export default function LoginPage() {
  const [email, setEmail] = useState('admin@pos.local'); const [password, setPassword] = useState('Admin123!'); const [err, setErr] = useState('');
  const nav = useNavigate(); const setAuth = useAuth((s) => s.setAuth);
  const submit = async (e) => { e.preventDefault(); setErr(''); try { const { data } = await api.post('/users/login', { email, password }); setAuth(data.user, data.token); nav('/'); } catch (ex) { setErr(ex.response?.data?.message || 'Login failed — is the server running on :5031?'); } };
  return <div className="max-w-md mx-auto mt-16"><Card><h1 className="text-xl font-bold mb-4">Staff Login</h1>
    <form onSubmit={submit} className="space-y-3"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />{err && <p className="text-red-600 text-sm">{err}</p>}<Btn className="w-full">Login</Btn></form>
    <p className="text-sm mt-3">Demo: admin@pos.local / Admin123! · cashier@pos.local / Cashier123!</p>
    <p className="text-sm mt-1"><Link className="underline" to="/register">Create an account</Link></p></Card></div>;
}
