import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Btn, Card, Err, Field, money, Screen, Title } from '../src/components/ui';
import api from '../src/services/api';
import { useAuth } from '../src/store';

const EMPTY = { name: '', sku: '', barcode: '', category: 'General', price: 0, stock: 0, lowStockAt: 5 };

export default function Items() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const isAdmin = useAuth((s) => s.user?.role) === 'admin';
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', search],
    queryFn: async () => (await api.get('/items', { params: { search } })).data,
  });

  const save = async () => {
    setErr('');
    try {
      const payload = { ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0, lowStockAt: Number(form.lowStockAt) || 0 };
      if (form._id) await api.put(`/items/${form._id}`, payload);
      else await api.post('/items', payload);
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Save failed');
    }
  };

  const remove = (item) => {
    Alert.alert('Delete item', `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/items/${item._id}`);
          queryClient.invalidateQueries({ queryKey: ['items'] });
        },
      },
    ]);
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Screen>
      <Title>Items</Title>
      <Field value={search} onChangeText={setSearch} placeholder="Search name, barcode or SKU…" />
      {isAdmin && !form && <Btn title="+ New Item" onPress={() => setForm({ ...EMPTY })} />}
      {form && (
        <Card>
          {['name', 'sku', 'barcode', 'category'].map((k) => (
            <Field key={k} value={String(form[k] ?? '')} onChangeText={set(k)} placeholder={k} />
          ))}
          {['price', 'stock', 'lowStockAt'].map((k) => (
            <Field key={k} value={String(form[k] ?? '')} onChangeText={set(k)} placeholder={k} keyboardType="numeric" />
          ))}
          <Err message={err} />
          <Btn title="Save" onPress={save} />
          <Btn title="Cancel" secondary onPress={() => setForm(null)} />
        </Card>
      )}
      {isLoading && <Text>Loading…</Text>}
      {items.map((item) => (
        <Card key={item._id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            <Text>{money(item.price)}</Text>
          </View>
          <Text style={{ color: '#475569', fontSize: 13 }}>
            {item.category} · SKU {item.sku} · Barcode {item.barcode || '—'}
          </Text>
          <Text style={{ fontSize: 13 }}>
            Stock: {item.stock}{' '}
            {item.stock <= (item.lowStockAt ?? 5) && <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠ Low stock</Text>}
          </Text>
          {isAdmin && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
              <Btn title="Edit" secondary onPress={() => setForm(item)} />
              <Btn title="Delete" secondary onPress={() => remove(item)} />
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}
