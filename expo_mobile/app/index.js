import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Btn, Card, Screen, Title } from '../src/components/ui';
import api from '../src/services/api';
import { useAuth, useSync } from '../src/store';
import { syncOutbox } from '../src/services/sync';

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const pending = useSync((s) => s.pending);
  const lastSync = useSync((s) => s.lastSync);

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get('/health')).data,
    retry: false,
  });

  return (
    <Screen>
      <Title>Web POS</Title>
      <Card>
        <Text>
          Signed in as {user?.name} ({user?.role})
        </Text>
        <Text style={{ color: '#475569', marginTop: 4 }}>
          Server: {health ? `${health.mode}${health.mongoConnected ? '' : ' (no MongoDB)'}` : 'unreachable — offline mode'}
        </Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: '600' }}>Offline queue: {pending} pending</Text>
        {lastSync && <Text style={{ color: '#475569' }}>Last sync: {new Date(lastSync).toLocaleString()}</Text>}
        <Btn title="Sync now" onPress={syncOutbox} secondary />
      </Card>
      <Btn title="POS Register" onPress={() => router.push('/pos')} />
      <Btn title="Items" onPress={() => router.push('/items')} />
      <Btn title="Customers" onPress={() => router.push('/customers')} />
      <Btn title="Invoices / History" onPress={() => router.push('/invoices')} />
      <View style={{ height: 12 }} />
      <Btn
        title="Log out"
        secondary
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}
