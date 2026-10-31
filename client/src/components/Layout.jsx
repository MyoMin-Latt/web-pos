import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useSync } from '../app/store';

const links = [
  { to: '/', label: 'POS', end: true },
  { to: '/items', label: 'Items' },
  { to: '/customers', label: 'Customers' },
  { to: '/invoices', label: 'Invoices' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { online, pending, lastSync } = useSync();
  const nav = useNavigate();
  const initial = (user?.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900">
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-sm shadow-indigo-600/30">
              W
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">Web POS</span>
              <span className="hidden text-xs text-slate-500 sm:block">Retail register</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                online ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {online ? 'Online' : 'Offline'}
            </span>
            {pending > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                Pending sync: {pending}
              </span>
            )}
            {lastSync && (
              <span className="hidden text-xs text-slate-500 lg:inline">
                Last sync {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {initial}
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-semibold">{user?.name}</span>
                <span className="block text-[11px] capitalize text-slate-500">{user?.role}</span>
              </span>
            </span>
            <button
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</main>
    </div>
  );
}
