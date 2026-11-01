import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Btn, Card, Err, Field, money, Screen, Title } from '../src/components/ui';
import api from '../src/services/api';

const EMPTY = { name: '', phone: '', email: '', address: '' };

export default function Customers() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [err, setErr] = useState('');
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => (await api.get('/customers', { params: { search } })).data,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['customer-history', historyFor?._id],
    queryFn: async () => (await api.get(`/customers/${historyFor._id}/history`)).data,
    enabled: !!historyFor,
  });

  const save = async () => {
    setErr('');
    try {
      if (form._id) await api.put(`/customers/${form._id}`, form);
      else await api.post('/customers', form);
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Save failed');
    }
  };

  const remove = (c) => {
    Alert.alert('Delete customer', `Delete ${c.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/customers/${c._id}`);
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
      },
    ]);
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Screen>
      <Title>Customers</Title>
      <Field value={search} onChangeText={setSearch} placeholder="Search name or phone…" />
      {!form && <Btn title="+ New Customer" onPress={() => setForm({ ...EMPTY })} />}
      {form && (
        <Card>
          {['name', 'phone', 'email', 'address'].map((k) => (
            <Field key={k} value={form[k] || ''} onChangeText={set(k)} placeholder={k} />
          ))}
          <Err message={err} />
          <Btn title="Save" onPress={save} />
          <Btn title="Cancel" secondary onPress={() => setForm(null)} />
        </Card>
      )}
      {customers.map((c) => (
        <Card key={c._id}>
          <Text style={{ fontWeight: '600' }}>{c.name}</Text>
          <Text style={{ fontSize: 13 }}>
            {c.phone} · {c.email}
          </Text>
          <Text style={{ fontSize: 13 }}>{c.address}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <Btn title="Edit" secondary onPress={() => setForm(c)} />
            <Btn title="Purchase history" secondary onPress={() => setHistoryFor(historyFor?._id === c._id ? null : c)} />
            <Btn title="Delete" secondary onPress={() => remove(c)} />
          </View>
          {historyFor?._id === c._id && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>History — {c.name}</Text>
              {history.length === 0 && <Text style={{ fontSize: 13 }}>No purchases yet.</Text>}
              {history.map((inv) => (
                <Text key={inv._id} style={{ fontSize: 13 }}>
                  {inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString()} · {money(inv.total)}
                </Text>
              ))}
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}
