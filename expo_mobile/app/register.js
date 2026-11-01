import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Btn, Err, Field, Screen, Title } from '../src/components/ui';
import api from '../src/services/api';
import { useAuth } from '../src/store';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [err, setErr] = useState('');
  const setAuth = useAuth((s) => s.setAuth);

  const submit = async () => {
    setErr('');
    try {
      const { data } = await api.post('/users/register', { name, email, password, role });
      await setAuth(data.user, data.token);
      router.replace('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Screen>
      <Title>Register Staff</Title>
      <Field value={name} onChangeText={setName} placeholder="Name" />
      <Field value={email} onChangeText={setEmail} placeholder="Email" />
      <Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Text style={{ marginBottom: 6 }}>Role</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Btn title="Cashier" secondary={role !== 'cashier'} onPress={() => setRole('cashier')} />
        <Btn title="Admin" secondary={role !== 'admin'} onPress={() => setRole('admin')} />
      </View>
      <Err message={err} />
      <Btn title="Register" onPress={submit} />
      <Btn title="Back to login" secondary onPress={() => router.back()} />
    </Screen>
  );
}
