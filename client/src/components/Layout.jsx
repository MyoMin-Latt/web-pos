import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useSync } from '../app/store';
export default function Layout({ children }) {
  const { user, logout } = useAuth(); const { online, pending, lastSync } = useSync(); const nav = useNavigate();
  return (<div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="no-print bg-slate-900 text-white px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
      <Link to="/" className="font-bold text-lg">Web POS</Link>
      <nav className="flex gap-4 text-sm"><Link to="/">POS</Link><Link to="/items">Items</Link><Link to="/customers">Customers</Link><Link to="/invoices">Invoices</Link></nav>
      <div className="flex items-center gap-3 text-sm">
        <span className={`px-2 py-1 rounded ${online ? 'bg-emerald-600' : 'bg-red-600'}`}>{online ? '● Online' : '● Offline'}</span>
        {pending > 0 && <span className="px-2 py-1 rounded bg-amber-500">Pending sync: {pending}</span>}
        {lastSync && <span className="hidden md:inline opacity-70">Last sync {new Date(lastSync).toLocaleTimeString()}</span>}
        <span>{user?.name} ({user?.role})</span>
        <button className="bg-white text-slate-900 px-2 py-1 rounded" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </div>
    </header>
    <main className="p-4 max-w-7xl mx-auto">{children}</main>
  </div>);
}
