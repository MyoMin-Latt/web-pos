import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui';
import Receipt from './Receipt';
import { useState } from 'react';
export default function InvoiceListPage() {
  const [selected, setSelected] = useState(null);
  const { data = [] } = useQuery({ queryKey: ['invoices'], queryFn: async () => (await api.get('/invoices')).data });
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Invoices / History</h1>
    {data.map((inv) => <Card key={inv._id}><button className="w-full text-left" onClick={() => setSelected(selected?._id === inv._id ? null : inv)}><div className="flex justify-between"><b>{inv.invoiceNo}</b><span>{inv.total?.toLocaleString()}</span></div><p className="text-sm">{inv.customerName} · {new Date(inv.invoiceDate).toLocaleDateString()} · {inv.paymentMethod} · {inv.items?.length} items</p></button>{selected?._id === inv._id && <div className="mt-3"><Receipt invoice={inv} /><button className="underline text-sm mt-2 no-print" onClick={() => window.print()}>Print</button></div>}</Card>)}
    {data.length === 0 && <p>No invoices yet.</p>}</div>;
}
