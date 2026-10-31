export default function Receipt({ invoice }) {
  if (!invoice) return null;
  return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">W</div>
      <h2 className="mt-3 text-lg font-bold tracking-tight">Web POS</h2>
      <p className="text-sm text-slate-500">{invoice.invoiceNo} · {new Date(invoice.invoiceDate).toLocaleString()}</p>
    </div>
    <p className="mt-4 text-sm text-slate-600">Customer: {invoice.customerName} · Payment: {invoice.paymentMethod}</p>
    <div className="my-3 border-t border-dashed border-slate-200" />
    {invoice.items.map((l, i) => <div key={i} className="flex justify-between py-1 text-sm"><span>{l.name} × {l.qty}</span><span className="font-medium">{(l.price * l.qty).toLocaleString()}</span></div>)}
    <div className="my-3 border-t border-dashed border-slate-200" />
    <div className="space-y-1 text-sm">
      <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{invoice.subtotal?.toLocaleString()}</span></div>
      <div className="flex justify-between text-slate-500"><span>Discount</span><span>{invoice.discount?.toLocaleString()}</span></div>
      <div className="flex justify-between text-slate-500"><span>Tax</span><span>{invoice.tax?.toLocaleString()}</span></div>
      <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span>{invoice.total?.toLocaleString()}</span></div>
    </div>
    <p className="mt-4 text-center text-sm text-slate-500">Thank you!</p>
  </div>;
}
