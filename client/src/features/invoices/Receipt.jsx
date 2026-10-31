export default function Receipt({ invoice }) {
  if (!invoice) return null;
  return <div className="bg-white border p-6 max-w-md mx-auto">
    <h2 className="text-center font-bold text-lg">Web POS — Receipt</h2>
    <p className="text-center text-sm">{invoice.invoiceNo} · {new Date(invoice.invoiceDate).toLocaleString()}</p>
    <p className="text-sm">Customer: {invoice.customerName} · Payment: {invoice.paymentMethod}</p><hr className="my-2" />
    {invoice.items.map((l, i) => <div key={i} className="flex justify-between text-sm"><span>{l.name} × {l.qty}</span><span>{(l.price * l.qty).toLocaleString()}</span></div>)}
    <hr className="my-2" />
    <div className="text-sm space-y-1"><div className="flex justify-between"><span>Subtotal</span><span>{invoice.subtotal?.toLocaleString()}</span></div>
    <div className="flex justify-between"><span>Discount</span><span>{invoice.discount?.toLocaleString()}</span></div>
    <div className="flex justify-between"><span>Tax</span><span>{invoice.tax?.toLocaleString()}</span></div>
    <div className="flex justify-between font-bold"><span>Total</span><span>{invoice.total?.toLocaleString()}</span></div></div>
    <p className="text-center text-sm mt-3">Thank you!</p>
  </div>;
}
