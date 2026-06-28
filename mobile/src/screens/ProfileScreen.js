import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image
} from 'react-native';
import { api } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY = '#7c3aed';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const LIGHT = '#f8fafc';
const BORDER = '#e2e8f0';

const STATUS_COLORS = {
  pending: '#f59e0b', paid: '#3b82f6', processing: '#8b5cf6',
  shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444', cancel_requested: '#f97316',
};

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await api('GET', '/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  useFocusEffect(useCallback(() => { if (user) loadOrders(); }, [user]));

  const viewOrder = async (order) => {
    setSelectedOrder(order);
    try {
      const detail = await api('GET', '/orders/' + order.id);
      setOrderDetail(detail);
    } catch (e) {}
  };

  const cancelOrder = async (id) => {
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', onPress: async () => {
        try { await api('PUT', '/orders/' + id + '/cancel'); loadOrders(); setSelectedOrder(null); Alert.alert('Done', 'Cancel requested'); }
        catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  };

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>👤</Text>
        <Text style={s.emptyTitle}>Login Required</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Auth')}>
          <Text style={s.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selectedOrder && orderDetail) {
    return (
      <ScrollView style={s.container}>
        <TouchableOpacity onPress={() => { setSelectedOrder(null); setOrderDetail(null); }} style={s.backBtn}>
          <Text style={s.backBtnText}>‹ Back to Orders</Text>
        </TouchableOpacity>
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>Order #{orderDetail.id}</Text>
          <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[orderDetail.status] || GRAY }]}>
            <Text style={s.statusText}>{orderDetail.status}</Text>
          </View>
          {(orderDetail.items || []).map((item, i) => {
            let img = '';
            if (item.color && item.color_images) {
              const ci = typeof item.color_images === 'string' ? JSON.parse(item.color_images) : item.color_images;
              if (ci[item.color] && ci[item.color].length) img = ci[item.color][0];
            }
            if (!img && item.images && item.images.length) img = item.images[0];
            return (
              <View key={i} style={s.orderItem}>
                {img ? <Image source={{ uri: 'http://10.0.2.2:3001' + img }} style={s.orderItemImg} resizeMode="cover" /> :
                  <View style={[s.orderItemImg, { backgroundColor: LIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>📷</Text></View>}
                <View style={{ flex: 1 }}>
                  <Text style={s.orderItemName} numberOfLines={1}>{item.name || item.en_name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {item.color ? <Text style={s.variantBadge}>{item.color}</Text> : null}
                    {item.size ? <Text style={s.variantBadge}>{item.size}</Text> : null}
                  </View>
                </View>
                <Text style={s.orderItemPrice}>৳{Number(item.price * item.quantity).toLocaleString('en-US')}</Text>
              </View>
            );
          })}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>৳{Number(orderDetail.total).toLocaleString('en-US')}</Text>
          </View>
          {(orderDetail.status === 'pending' || orderDetail.status === 'paid') && (
            <TouchableOpacity style={s.cancelBtn} onPress={() => cancelOrder(orderDetail.id)}>
              <Text style={s.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={{ fontSize: 32 }}>👤</Text></View>
        <Text style={s.userName}>{user.name || 'User'}</Text>
        <Text style={s.userEmail}>{user.email}</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'profile' && s.tabActive]} onPress={() => setTab('profile')}>
          <Text style={[s.tabText, tab === 'profile' && s.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'orders' && s.tabActive]} onPress={() => { setTab('orders'); loadOrders(); }}>
          <Text style={[s.tabText, tab === 'orders' && s.tabTextActive]}>Orders ({orders.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'profile' ? (
        <View style={s.section}>
          <View style={s.infoRow}><Text style={s.infoLabel}>Name</Text><Text style={s.infoValue}>{user.name || '-'}</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Email</Text><Text style={s.infoValue}>{user.email}</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Phone</Text><Text style={s.infoValue}>{user.phone || '-'}</Text></View>
          <TouchableOpacity style={s.logoutBtn} onPress={() => { logout(); Alert.alert('Logged out'); }}>
            <Text style={s.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.section}>
          {orders.length === 0 ? (
            <Text style={s.emptyTitle}>No orders yet</Text>
          ) : orders.map(order => (
            <TouchableOpacity key={order.id} style={s.orderCard} onPress={() => viewOrder(order)}>
              <View style={s.orderHeader}>
                <Text style={s.orderId}>#{order.id}</Text>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[order.status] || GRAY }]}>
                  <Text style={s.statusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={s.orderTotal}>৳{Number(order.total).toLocaleString('en-US')}</Text>
              <Text style={s.orderDate}>{order.created_at}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT },
  profileCard: { alignItems: 'center', padding: 24, backgroundColor: PRIMARY },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: '#fff' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: PRIMARY },
  tabText: { fontSize: 15, fontWeight: '600', color: GRAY },
  tabTextActive: { color: PRIMARY },
  section: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  infoLabel: { fontSize: 14, color: GRAY },
  infoValue: { fontSize: 14, fontWeight: '600', color: DARK },
  logoutBtn: { backgroundColor: '#fee2e2', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  logoutBtnText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  loginBtn: { backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  loginBtnText: { color: '#fff', fontWeight: '700' },
  emptyTitle: { fontSize: 16, color: GRAY, textAlign: 'center', marginTop: 40 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 15, fontWeight: '700', color: DARK },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: PRIMARY, marginBottom: 2 },
  orderDate: { fontSize: 12, color: GRAY },
  backBtn: { padding: 16, paddingBottom: 0 },
  backBtnText: { fontSize: 16, color: PRIMARY, fontWeight: '600' },
  detailCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: BORDER },
  detailTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 8 },
  orderItem: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER, alignItems: 'center' },
  orderItemImg: { width: 56, height: 56, borderRadius: 8 },
  orderItemName: { fontSize: 13, fontWeight: '600', color: DARK, marginBottom: 4 },
  variantBadge: { fontSize: 11, fontWeight: '600', color: PRIMARY, backgroundColor: '#f0e6ff', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3 },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: DARK },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: BORDER },
  totalLabel: { fontSize: 16, fontWeight: '700', color: DARK },
  totalValue: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  cancelBtn: { backgroundColor: '#fee2e2', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  cancelBtnText: { color: '#ef4444', fontWeight: '700' },
});
