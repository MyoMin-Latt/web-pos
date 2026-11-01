import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../src/store';
import { syncOutbox } from '../src/services/sync';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navReady = useRootNavigationState()?.key;
  const user = useAuth((s) => s.user);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Restore the saved login, then start the offline-sync timer (15s, like web).
  useEffect(() => {
    useAuth.getState().restore().then(() => setBootstrapped(true));
    syncOutbox();
    const timer = setInterval(syncOutbox, 15000);
    return () => clearInterval(timer);
  }, []);

  // Auth gate: unauthenticated users only see login/register.
  useEffect(() => {
    if (!bootstrapped || !navReady) return;
    const inAuth = segments[0] === 'login' || segments[0] === 'register';
    if (!user && !inAuth) router.replace('/login');
    else if (user && inAuth) router.replace('/');
  }, [user, segments, bootstrapped, navReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Web POS' }} />
        <Stack.Screen name="login" options={{ title: 'Staff Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register Staff' }} />
        <Stack.Screen name="pos" options={{ title: 'POS Register' }} />
        <Stack.Screen name="items" options={{ title: 'Items' }} />
        <Stack.Screen name="customers" options={{ title: 'Customers' }} />
        <Stack.Screen name="invoices" options={{ title: 'Invoices / History' }} />
        <Stack.Screen name="scan" options={{ title: 'Scan barcode' }} />
      </Stack>
    </QueryClientProvider>
  );
}
