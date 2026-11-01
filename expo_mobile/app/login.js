import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Btn, Err, Field, Screen, Title } from '../src/components/ui';
import api from '../src/services/api';
import { useAuth } from '../src/store';

export default function Login() {
  const [email, setEmail] = useState('admin@pos.local');
  const [password, setPassword] = useState('Admin123!');
  const [err, setErr] = useState('');
  const setAuth = useAuth((s) => s.setAuth);

  const submit = async () => {
    setErr('');
    try {
      const { data } = await api.post('/users/login', { email, password });
      await setAuth(data.user, data.token);
      router.replace('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Login failed — is the server running on :5031?');
    }
  };

  return (
    <Screen>
      <Title>Staff Login</Title>
      <Field value={email} onChangeText={setEmail} placeholder="Email" />
      <Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Err message={err} />
      <Btn title="Login" onPress={submit} />
      <Text style={{ marginTop: 12, color: '#475569' }}>Demo: admin@pos.local / Admin123! · cashier@pos.local / Cashier123!</Text>
      <Btn title="Create an account" secondary onPress={() => router.push('/register')} />
    </Screen>
  );
}
