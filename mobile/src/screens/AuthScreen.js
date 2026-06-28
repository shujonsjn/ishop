import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const PRIMARY = '#7c3aed';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const BORDER = '#e2e8f0';

export default function AuthScreen({ navigation }) {
  const { login, register } = useContext(AuthContext);
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Fill all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Fill all fields'); return; }
    setLoading(true);
    try {
      await register(name, email, phone, password);
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.brand}>ইশপ</Text>
          <Text style={s.subtitle}>Online Shopping</Text>
        </View>

        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, tab === 'login' && s.tabActive]} onPress={() => setTab('login')}>
            <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'register' && s.tabActive]} onPress={() => setTab('register')}>
            <Text style={[s.tabText, tab === 'register' && s.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={s.form}>
          {tab === 'register' && (
            <TextInput style={s.input} placeholder="Full Name" value={name} onChangeText={setName} />
          )}
          <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" />
          {tab === 'register' && (
            <TextInput style={s.input} placeholder="Phone (optional)" value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" />
          )}
          <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword}
            secureTextEntry />

          <TouchableOpacity style={s.submitBtn} onPress={tab === 'login' ? handleLogin : handleRegister} disabled={loading}>
            <Text style={s.submitBtnText}>{loading ? 'Please wait...' : (tab === 'login' ? 'Login' : 'Create Account')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  brand: { fontSize: 36, fontWeight: '800', color: PRIMARY },
  subtitle: { fontSize: 14, color: GRAY, marginTop: 4 },
  tabs: { flexDirection: 'row', marginBottom: 24, borderBottomWidth: 2, borderBottomColor: BORDER },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -2 },
  tabActive: { borderBottomColor: PRIMARY },
  tabText: { fontSize: 16, fontWeight: '600', color: GRAY },
  tabTextActive: { color: PRIMARY },
  form: { gap: 14 },
  input: { borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  submitBtn: { backgroundColor: PRIMARY, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
