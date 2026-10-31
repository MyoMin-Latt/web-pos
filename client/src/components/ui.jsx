export const Btn = ({ children, ...p }) => <button className="bg-slate-900 text-white px-3 py-2 rounded disabled:opacity-50" {...p}>{children}</button>;
export const Input = (p) => <input className="border rounded px-2 py-2 w-full" {...p} />;
export const Card = ({ children }) => <div className="bg-white rounded shadow p-4">{children}</div>;
