const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
const variants = {
  primary: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700",
  secondary: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

export const Btn = ({ children, variant = "primary", className = "", ...p }) => (
  <button className={`${baseBtn} ${variants[variant] || variants.primary} ${className}`} {...p}>
    {children}
  </button>
);

export const Input = ({ className = "", ...p }) => (
  <input
    className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none disabled:opacity-50 ${className}`}
    {...p}
  />
);

export const Select = ({ className = "", ...p }) => (
  <select
    className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none ${className}`}
    {...p}
  />
);

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ tone = "slate", children }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap gap-2">{children}</div>}
  </div>
);

export const Field = ({ label, children }) => (
  <label className="block text-sm">
    <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
    {children}
  </label>
);
