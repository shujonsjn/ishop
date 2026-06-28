import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, FlatList, Alert, Dimensions
} from 'react-native';
import { api } from '../api/client';
import { AuthContext } from '../context/AuthContext';

const { width: W } = Dimensions.get('window');
const PRIMARY = '#7c3aed';
const SECONDARY = '#e91e63';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const LIGHT = '#f8fafc';
const BORDER = '#e2e8f0';

export default function ProductDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api('GET', '/products/' + id).then(setProduct).catch(() => {});
  }, [id]);

  if (!product) return <View style={s.center}><Text>Loading...</Text></View>;

  const images = (() => {
    if (selectedColor && product.color_images) {
      const ci = typeof product.color_images === 'string' ? JSON.parse(product.color_images) : product.color_images;
      if (ci[selectedColor] && ci[selectedColor].length) return ci[selectedColor];
    }
    return product.images || [];
  })();

  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

  const addToCart = async () => {
    if (!user) { Alert.alert('Login Required', 'Please login first'); return; }
    if (colors.length && !selectedColor) { Alert.alert('Select Color', 'Please select a color'); return; }
    if (sizes.length && !selectedSize) { Alert.alert('Select Size', 'Please select a size'); return; }
    try {
      await api('POST', '/cart', {
        productId: product.id, quantity: qty,
        color: selectedColor || null, size: selectedSize || null
      });
      Alert.alert('Added', 'Item added to cart');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const buyNow = async () => {
    if (!user) { Alert.alert('Login Required', 'Please login first'); return; }
    if (colors.length && !selectedColor) { Alert.alert('Select Color', 'Please select a color'); return; }
    if (sizes.length && !selectedSize) { Alert.alert('Select Size', 'Please select a size'); return; }
    try {
      await api('POST', '/cart', {
        productId: product.id, quantity: qty,
        color: selectedColor || null, size: selectedSize || null
      });
      navigation.navigate('CartTab');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.imgWrap}>
        {images.length > 0 ? (
          <Image source={{ uri: 'http://10.0.2.2:3001' + images[selectedImg] }}
            style={s.mainImg} resizeMode="contain" />
        ) : <View style={[s.mainImg, s.noImg]}><Text style={{ fontSize: 48 }}>📷</Text></View>}
      </View>
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbs}>
          {images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setSelectedImg(i)}
              style={[s.thumb, selectedImg === i && s.thumbActive]}>
              <Image source={{ uri: 'http://10.0.2.2:3001' + img }} style={s.thumbImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={s.info}>
        {discount > 0 && <View style={s.discountBadge}><Text style={s.discountText}>-{discount}% OFF</Text></View>}
        <Text style={s.name}>{product.name || product.en_name}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>৳{Number(product.price).toLocaleString('en-US')}</Text>
          {product.compare_price > 0 && <Text style={s.comparePrice}>৳{Number(product.compare_price).toLocaleString('en-US')}</Text>}
        </View>

        {colors.length > 0 && (
          <View style={s.optionSection}>
            <Text style={s.optionLabel}>Color: {selectedColor || 'Select'}</Text>
            <View style={s.optionRow}>
              {colors.map(c => (
                <TouchableOpacity key={c} style={[s.optionBtn, selectedColor === c && s.optionBtnActive]}
                  onPress={() => setSelectedColor(c)}>
                  <Text style={[s.optionText, selectedColor === c && s.optionTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {sizes.length > 0 && (
          <View style={s.optionSection}>
            <Text style={s.optionLabel}>Size: {selectedSize || 'Select'}</Text>
            <View style={s.optionRow}>
              {sizes.map(sz => (
                <TouchableOpacity key={sz} style={[s.optionBtn, selectedSize === sz && s.optionBtnActive]}
                  onPress={() => setSelectedSize(sz)}>
                  <Text style={[s.optionText, selectedSize === sz && s.optionTextActive]}>{sz}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={s.qtyRow}>
          <Text style={s.optionLabel}>Quantity:</Text>
          <View style={s.qtyControl}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={s.qtyBtnText}>−</Text></TouchableOpacity>
            <Text style={s.qtyDisplay}>{qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(qty + 1)}><Text style={s.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        {product.description ? (
          <View style={s.descSection}>
            <Text style={s.descTitle}>Description</Text>
            <Text style={s.descText}>{product.description}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.cartBtn} onPress={addToCart}>
          <Text style={s.cartBtnText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.buyBtn} onPress={buyNow}>
          <Text style={s.buyBtnText}>⚡ Buy Now</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imgWrap: { width: W, height: W, backgroundColor: LIGHT, justifyContent: 'center', alignItems: 'center' },
  mainImg: { width: '100%', height: '100%' },
  noImg: { justifyContent: 'center', alignItems: 'center' },
  thumbs: { paddingHorizontal: 12, gap: 8, paddingVertical: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, borderWidth: 2, borderColor: BORDER, overflow: 'hidden' },
  thumbActive: { borderColor: PRIMARY },
  thumbImg: { width: '100%', height: '100%' },
  info: { padding: 16 },
  discountBadge: { backgroundColor: SECONDARY, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  price: { fontSize: 24, fontWeight: '800', color: PRIMARY },
  comparePrice: { fontSize: 16, color: GRAY, textDecorationLine: 'line-through' },
  optionSection: { marginBottom: 14 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: BORDER },
  optionBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  optionText: { fontSize: 13, fontWeight: '600', color: DARK },
  optionTextActive: { color: '#fff' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER, borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  qtyBtnText: { fontSize: 18, fontWeight: '600' },
  qtyDisplay: { width: 44, textAlign: 'center', fontSize: 16, fontWeight: '600', borderLeftWidth: 1, borderRightWidth: 1, borderColor: BORDER },
  descSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  descTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 8 },
  descText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  bottomBar: { flexDirection: 'row', gap: 12, padding: 16 },
  cartBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 2, borderColor: PRIMARY, alignItems: 'center' },
  cartBtnText: { fontSize: 15, fontWeight: '700', color: PRIMARY },
  buyBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: PRIMARY, alignItems: 'center' },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
