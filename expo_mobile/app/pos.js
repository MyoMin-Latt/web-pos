import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Btn, Card, Err, Field, money, Screen, Title } from '../src/components/ui';
import Receipt from '../src/components/Receipt';
import api from '../src/services/api';
import { getCachedItems, queueInvoice, setCachedItems } from '../src/services/storage';
import { useCart, useScan, useSync } from '../src/store';

export default function Pos() {
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [err, setErr] = useState('');
  const cart = useCart();
  const scanned = useScan((s) => s.barcode);
  const clearScanned = useScan((s) => s.clear);
  const setPending = useSync((s) => s.setPending);
  const queryClient = useQueryClient();

  // A barcode scanned on /scan lands here; search for it, then clear it.
  useEffect(() => {
    if (scanned) {
      setSearch(scanned);
      clearScanned();
    }
  }, [scanned]);

  // Item list: server first, cached items when offline (same as web).
  const { data: items = [] } = useQuery({
    queryKey: ['items', search],
    queryFn: async () => {
      try {
        const { data } = await api.get('/items', { params: { search } });
        if (!search) await setCachedItems(data);
        return data;
      } catch {
        const cached = await getCachedItems();
        const q = search.toLowerCase();
        return q ? cached.filter((i) => [i.name, i.sku, i.barcode].some((f) => (f || '').toLowerCase().includes(q))) : cached;
      }
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await api.get('/customers')).data,
    retry: false,
  });

  const customerMatches = useMemo(() => {
    const q = customerSearch.toLowerCase();
    if (!q) return [];
    return customers.filter((c) => [c.name, c.phone].some((f) => (f || '').toLowerCase().includes(q))).slice(0, 8);
  }, [customers, customerSearch]);

  const subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const total = Math.max(0, subtotal - cart.discount + cart.tax);

  const checkout = async () => {
    if (!cart.lines.length) return;
    setErr('');
    const payload = {
      customerId: cart.customer?._id || null,
      customerName: cart.customer?.name || 'Walk-in',
      items: cart.lines,
      discount: cart.discount,
      tax: cart.tax,
      paymentMethod: cart.paymentMethod,
      invoiceDate: cart.invoiceDate,
    };
    try {
      const { data } = await api.post('/invoices', payload);
      setReceipt(data);
      cart.clear();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch {
      // Offline: queue it exactly like the web app does.
      const pending = await queueInvoice(payload);
      setPending(pending);
      setReceipt({ ...payload, invoiceNo: `OFFLINE-${Date.now()}`, subtotal, total });
      cart.clear();
      setErr('Offline: sale queued locally. It will sync automatically when back online.');
    }
  };

  return (
    <Screen>
      <Title>POS Register</Title>

      {receipt ? (
        <>
          <Receipt invoice={receipt} />
          <Err message={err} />
          <Btn title="New sale" onPress={() => { setReceipt(null); setErr(''); }} />
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field value={search} onChangeText={setSearch} placeholder="Scan barcode or type name / SKU…" />
            </View>
            <Btn title="Scan" onPress={() => router.push('/scan')} />
          </View>

          {items.map((item) => (
            <Card key={item._id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                <Text>{money(item.price)}</Text>
              </View>
              <Text style={{ color: '#475569', fontSize: 13 }}>
                {item.category} · {item.sku} · Stock {item.stock}{' '}
                {item.stock <= (item.lowStockAt ?? 5) && <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠ Low</Text>}
              </Text>
              <Btn title="Add to cart" secondary onPress={() => cart.add(item)} />
            </Card>
          ))}
          {items.length === 0 && <Text style={{ color: '#475569', marginBottom: 12 }}>No items found.</Text>}

          <Card>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Cart</Text>
            {cart.lines.length === 0 && <Text style={{ fontSize: 13 }}>Cart is empty.</Text>}
            {cart.lines.map((l) => (
              <View key={l.item} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, flex: 1 }}>{l.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={() => cart.setQty(l.item, l.qty - 1)}>
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold' }}>{l.qty}</Text>
                  <TouchableOpacity onPress={() => cart.setQty(l.item, l.qty + 1)}>
                    <Text style={{ fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => cart.remove(l.item)}>
                    <Text style={{ color: '#dc2626' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, width: 80, textAlign: 'right' }}>{money(l.price * l.qty)}</Text>
              </View>
            ))}

            <Text style={{ marginTop: 12, marginBottom: 4 }}>Customer: {cart.customer?.name || 'Walk-in'}</Text>
            <Field value={customerSearch} onChangeText={setCustomerSearch} placeholder="Search customer to select…" />
            {customerMatches.map((c) => (
              <TouchableOpacity key={c._id} onPress={() => { cart.setCustomer(c); setCustomerSearch(''); }}>
                <Text style={{ paddingVertical: 6, color: '#0f172a' }}>
                  {c.name} · {c.phone}
                </Text>
              </TouchableOpacity>
            ))}
            {cart.customer && <Btn title="Use Walk-in instead" secondary onPress={() => cart.setCustomer(null)} />}

            <Text style={{ marginTop: 8 }}>Invoice date (YYYY-MM-DD)</Text>
            <Field value={cart.invoiceDate} onChangeText={cart.setInvoiceDate} placeholder="YYYY-MM-DD" />
            <Text>Discount</Text>
            <Field value={String(cart.discount)} onChangeText={cart.setDiscount} keyboardType="numeric" placeholder="Discount" />
            <Text>Tax</Text>
            <Field value={String(cart.tax)} onChangeText={cart.setTax} keyboardType="numeric" placeholder="Tax" />
            <Text>Payment</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Btn title="Cash" secondary={cart.paymentMethod !== 'cash'} onPress={() => cart.setPaymentMethod('cash')} />
              <Btn title="Card" secondary={cart.paymentMethod !== 'card'} onPress={() => cart.setPaymentMethod('card')} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold' }}>Total</Text>
              <Text style={{ fontWeight: 'bold' }}>{money(total)}</Text>
            </View>
            <Btn title="Checkout" disabled={!cart.lines.length} onPress={checkout} />
            <Err message={err} />
          </Card>
        </>
      )}
    </Screen>
  );
}
