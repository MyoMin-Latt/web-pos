import { Text, View } from 'react-native';
import { money } from './ui';

// Same receipt layout as the web app (web PosPage / Receipt.jsx).
export default function Receipt({ invoice }) {
  if (!invoice) return null;
  return (
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 12 }}>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>Web POS — Receipt</Text>
      <Text style={{ textAlign: 'center', fontSize: 13, marginBottom: 8 }}>
        {invoice.invoiceNo} · {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString() : ''}
      </Text>
      <Text style={{ fontSize: 13 }}>
        Customer: {invoice.customerName} · Payment: {invoice.paymentMethod}
      </Text>
      <View style={{ borderBottomWidth: 1, borderColor: '#e2e8f0', marginVertical: 8 }} />
      {(invoice.items || []).map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>
            {it.name} × {it.qty}
          </Text>
          <Text style={{ fontSize: 13 }}>{money(it.price * it.qty)}</Text>
        </View>
      ))}
      <View style={{ borderBottomWidth: 1, borderColor: '#e2e8f0', marginVertical: 8 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13 }}>Subtotal</Text>
        <Text style={{ fontSize: 13 }}>{money(invoice.subtotal)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13 }}>Discount</Text>
        <Text style={{ fontSize: 13 }}>{money(invoice.discount)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13 }}>Tax</Text>
        <Text style={{ fontSize: 13 }}>{money(invoice.tax)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Total</Text>
        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{money(invoice.total)}</Text>
      </View>
      <Text style={{ textAlign: 'center', fontSize: 13, marginTop: 10 }}>Thank you!</Text>
    </View>
  );
}
