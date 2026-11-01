import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, Badge, PageHeader } from '../../components/ui';
import Receipt from './Receipt';
import { useState } from 'react';
export default function InvoiceListPage() {
  const [selected, setSelected] = useState(null);
  const { data = [] } = useQuery({ queryKey: ['invoices'], queryFn: async () => (await api.get('/invoices')).data });
  return <div className="space-y-5">
    <PageHeader title="Invoices" subtitle="Sales history — tap an invoice to view and print its receipt." />
    {data.map((inv) => <Card key={inv._id} className="transition hover:border-indigo-200">
      <button className="w-full text-left" onClick={() => setSelected(selected?._id === inv._id ? null : inv)}>
        <div className="flex items-start justify-between gap-3"><b className="tracking-tight">{inv.invoiceNo}</b><span className="font-bold text-indigo-700">{inv.total?.toLocaleString()}</span></div>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500"><span>{inv.customerName}</span><span>·</span><span>{new Date(inv.invoiceDate).toLocaleDateString()}</span><Badge tone="indigo">{inv.paymentMethod}</Badge><span>{inv.items?.length} items</span></p>
      </button>
      {selected?._id === inv._id && <div className="mt-4 border-t border-slate-100 pt-4"><Receipt invoice={inv} /><button className="mt-3 text-sm font-medium text-slate-600 underline no-print" onClick={() => window.print()}>Print</button></div>}
    </Card>)}
    {data.length === 0 && <Card><p className="text-sm text-slate-500">No invoices yet.</p></Card>}
  </div>;
}
