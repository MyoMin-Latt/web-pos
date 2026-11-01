import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const money = (n) => (n ?? 0).toLocaleString();

export function Screen({ children }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {children}
    </ScrollView>
  );
}

export function Card({ children }) {
  return (
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10 }}>
      {children}
    </View>
  );
}

export function Title({ children }) {
  return <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>{children}</Text>;
}

export function Btn({ title, onPress, disabled, secondary }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: secondary ? '#e2e8f0' : '#0f172a',
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 4,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: secondary ? '#0f172a' : '#fff', fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Field({ value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = 'none' }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 }}
    />
  );
}

export function Err({ message }) {
  if (!message) return null;
  return <Text style={{ color: '#dc2626', marginBottom: 8 }}>{message}</Text>;
}
