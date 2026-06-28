import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { api } from '../api/client';
import { AuthContext } from '../context/AuthContext';

const PRIMARY = '#7c3aed';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const BORDER = '#e2e8f0';

export default function CheckoutScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [payment, setPayment] = useState('cod');
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    api('GET', '/cart').then(d => setCartTotal(d.total || 0)).catch(() => {});
  }, [user]);

  const placeOrder = async () => {
    if (!name || !phone || !address || !district) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (!/^(\+?880)?01[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Invalid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await api('POST', '/orders', {
        name, phone, address, district, thana,
        paymentMethod: payment, deliveryCharge: district.toLowerCase().includes('dhaka') ? 150 : 250,
      });
      Alert.alert('Order Placed!', 'Order #' + (res.orderId || res.id), [
        { text: 'OK', onPress: () => navigation.navigate('ProfileTab') }
      ]);
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container}>
        <Text style={s.title}>Checkout</Text>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Delivery Info</Text>
          <TextInput style={s.input} placeholder="Full Name *" value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Phone * (+880...)" value={phone} onChangeText={setPhone}
            keyboardType="phone-pad" />
          <TextInput style={s.input} placeholder="Address *" value={address} onChangeText={setAddress}
            multiline numberOfLines={2} />
          <TextInput style={s.input} placeholder="District *" value={district} onChangeText={setDistrict} />
          <TextInput style={s.input} placeholder="Thana" value={thana} onChangeText={setThana} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Method</Text>
          <View style={s.payGrid}>
            {[{ id: 'cod', label: 'Cash on Delivery', icon: '💵' },
              { id: 'bkash', label: 'bKash', icon: '📱' },
              { id: 'nagad', label: 'Nagad', icon: '💳' }].map(m => (
              <TouchableOpacity key={m.id} style={[s.payCard, payment === m.id && s.payActive]}
                onPress={() => setPayment(m.id)}>
                <Text style={s.payIcon}>{m.icon}</Text>
                <Text style={[s.payLabel, payment === m.id && s.payLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Subtotal</Text><Text style={s.summaryVal}>৳{Number(cartTotal).toLocaleString('en-US')}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Delivery</Text><Text style={s.summaryVal}>৳{district.toLowerCase().includes('dhaka') ? '150' : '250'}</Text></View>
          <View style={[s.summaryRow, { borderTopWidth: 2, borderTopColor: BORDER, paddingTop: 10, marginTop: 6 }]}>
            <Text style={[s.summaryLabel, { fontWeight: '700', color: DARK, fontSize: 16 }]}>Total</Text>
            <Text style={[s.summaryVal, { fontWeight: '800', color: PRIMARY, fontSize: 18 }]}>
              ৳{Number(cartTotal + (district.toLowerCase().includes('dhaka') ? 150 : 250)).toLocaleString('en-US')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={[s.orderBtn, loading && { opacity: 0.6 }]} onPress={placeOrder} disabled={loading}>
          <Text style={s.orderBtnText}>{loading ? 'Placing Order...' : 'Place Order'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: DARK, marginBottom: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 12 },
  input: { borderWidth: 1.5, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  payGrid: { gap: 10 },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: BORDER, borderRadius: 10, padding: 14 },
  payActive: { borderColor: PRIMARY, backgroundColor: '#f5f0ff' },
  payIcon: { fontSize: 24 },
  payLabel: { fontSize: 14, fontWeight: '600', color: DARK },
  payLabelActive: { color: PRIMARY },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: GRAY },
  summaryVal: { fontSize: 14, fontWeight: '600', color: DARK },
  orderBtn: { backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  orderBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
