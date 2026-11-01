import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, money, Screen, Title } from '../src/components/ui';
import Receipt from '../src/components/Receipt';
import api from '../src/services/api';

export default function Invoices() {
  const [expandedId, setExpandedId] = useState(null);
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await api.get('/invoices')).data,
  });

  return (
    <Screen>
      <Title>Invoices / History</Title>
      {invoices.length === 0 && <Text>No invoices yet.</Text>}
      {invoices.map((inv) => (
        <Card key={inv._id}>
          <TouchableOpacity onPress={() => setExpandedId(expandedId === inv._id ? null : inv._id)}>
            <Text style={{ fontWeight: '600' }}>
              {inv.invoiceNo} · {money(inv.total)}
            </Text>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              {inv.customerName} · {new Date(inv.invoiceDate).toLocaleDateString()} · {inv.paymentMethod} ·{' '}
              {(inv.items || []).length} items
            </Text>
          </TouchableOpacity>
          {expandedId === inv._id && (
            <>
              <Text>{' '}</Text>
              <Receipt invoice={inv} />
            </>
          )}
        </Card>
      ))}
    </Screen>
  );
}
