import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { api } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY = '#7c3aed';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const LIGHT = '#f8fafc';
const BORDER = '#e2e8f0';

export default function CartScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    try {
      const data = await api('GET', '/cart');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadCart(); }, [user]));

  const updateQty = async (itemId, qty) => {
    if (qty < 1) { removeItem(itemId); return; }
    try {
      await api('PUT', '/cart/' + itemId, { quantity: qty });
      loadCart();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const removeItem = async (itemId) => {
    try {
      await api('DELETE', '/cart/' + itemId);
      loadCart();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
        <Text style={s.emptyTitle}>Login Required</Text>
        <Text style={s.emptyHint}>Please login to view your cart</Text>
      </View>
    );
  }

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={PRIMARY} /></View>;

  if (items.length === 0) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 12 }}>🛒</Text>
        <Text style={s.emptyTitle}>Cart is Empty</Text>
        <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
          <Text style={s.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Shopping Cart</Text>
        <Text style={s.headerCount}>{itemCount} items</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          let img = '';
          if (item.color && item.color_images) {
            const ci = typeof item.color_images === 'string' ? JSON.parse(item.color_images) : item.color_images;
            if (ci[item.color] && ci[item.color].length) img = ci[item.color][0];
          }
          if (!img && item.images && item.images.length) img = item.images[0];

          return (
            <View style={s.cartItem}>
              {img ? <Image source={{ uri: 'http://10.0.2.2:3001' + img }} style={s.itemImg} resizeMode="cover" /> :
                <View style={[s.itemImg, { backgroundColor: LIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>📷</Text></View>}
              <View style={s.itemInfo}>
                <Text style={s.itemName} numberOfLines={1}>{item.name || item.en_name}</Text>
                <View style={s.variantRow}>
                  {item.color ? <View style={s.variantBadge}><Text style={s.variantText}>{item.color}</Text></View> : null}
                  {item.size ? <View style={s.variantBadge}><Text style={s.variantText}>{item.size}</Text></View> : null}
                </View>
                <Text style={s.itemPrice}>৳{Number(item.price).toLocaleString('en-US')}</Text>
              </View>
              <View style={s.itemRight}>
                <View style={s.qtyControl}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.id, item.quantity - 1)}>
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyDisplay}>{item.quantity}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.id, item.quantity + 1)}>
                    <Text style={s.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={s.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <View style={s.summary}>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={s.summaryValue}>৳{Number(total).toLocaleString('en-US')}</Text>
        </View>
        <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={s.checkoutBtnText}>Place Order — ৳{Number(total).toLocaleString('en-US')}</Text>
        </TouchableOpacity>
        <Text style={s.secureText}>🔒 Secure checkout</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 0 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  headerCount: { fontSize: 13, color: GRAY },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: BORDER },
  itemImg: { width: 72, height: 72, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 4 },
  variantRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  variantBadge: { backgroundColor: '#f0e6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  variantText: { fontSize: 11, fontWeight: '600', color: PRIMARY },
  itemPrice: { fontSize: 15, fontWeight: '700', color: PRIMARY },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  qtyControl: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  qtyBtnText: { fontSize: 16, fontWeight: '600' },
  qtyDisplay: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: '600', lineHeight: 30 },
  removeBtn: { fontSize: 16, color: '#d1d5db', fontWeight: '600' },
  summary: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: BORDER },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: GRAY },
  summaryValue: { fontSize: 14, fontWeight: '700', color: DARK },
  checkoutBtn: { backgroundColor: PRIMARY, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secureText: { textAlign: 'center', fontSize: 11, color: GRAY, marginTop: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 12 },
  emptyHint: { fontSize: 14, color: GRAY },
  shopBtn: { backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 12 },
  shopBtnText: { color: '#fff', fontWeight: '600' },
});
