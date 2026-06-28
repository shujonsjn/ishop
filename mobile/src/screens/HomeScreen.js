import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, RefreshControl, Dimensions, ScrollView
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

function ProductCard({ product, onPress }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  let img = '';
  if (product.color_images) {
    const ci = typeof product.color_images === 'string' ? JSON.parse(product.color_images) : product.color_images;
    const firstColor = Object.keys(ci)[0];
    if (ci[firstColor] && ci[firstColor].length) img = ci[firstColor][0];
  }
  if (!img && product.images && product.images.length) img = product.images[0];

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardImgWrap}>
        {discount > 0 && <View style={s.discountBadge}><Text style={s.discountText}>-{discount}%</Text></View>}
        {img ? (
          <Image source={{ uri: 'http://10.0.2.2:3001' + img }} style={s.cardImg} resizeMode="cover" />
        ) : (
          <View style={[s.cardImg, s.noImg]}><Text style={{ fontSize: 32 }}>📷</Text></View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{product.name || product.en_name}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>৳{Number(product.price).toLocaleString('en-US')}</Text>
          {product.compare_price > 0 && (
            <Text style={s.comparePrice}>৳{Number(product.compare_price).toLocaleString('en-US')}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BannerSlide({ item }) {
  return (
    <View style={[s.bannerSlide, { width: W - 32 }]}>  
      {item.image ? (
        <Image source={{ uri: 'http://10.0.2.2:3001' + item.image }} style={s.bannerImg} resizeMode="cover" />
      ) : (
        <View style={[s.bannerImg, { backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' }]}>  
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{item.title || 'Shop Now'}</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);

  const load = async () => {
    try {
      const [cats, prods, settings] = await Promise.all([
        api('GET', '/categories'),
        api('GET', '/products?limit=20'),
        api('GET', '/settings/public'),
      ]);
      setCategories(cats || []);
      setProducts(prods.products || prods || []);
      if (settings && settings.banners) {
        try {
          const b = typeof settings.banners === 'string' ? JSON.parse(settings.banners) : settings.banners;
          setBanners((b.slides || []).filter(s => s.show !== '0'));
        } catch (e) { setBanners([]); }
      }
    } catch (e) {}
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const catIcons = ['💻','🍽️','🍕','👗','🧳','🏊','📚','🎮','🔧','🎵','🖼️','📷','🎒','🏠'];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}>
      {banners.length > 0 && (
        <View style={s.bannerWrap}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            contentOffset={{ x: bannerIdx * (W - 32), y: 0 }}
            onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (W - 32)))}>
            {banners.map((b, i) => <BannerSlide key={i} item={b} />)}
          </ScrollView>
          {banners.length > 1 && (
            <View style={s.dots}>
              {banners.map((_, i) => <View key={i} style={[s.dot, i === bannerIdx && s.dotActive]} />)}
            </View>
          )}
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>⚡ Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {categories.map((c, i) => (
            <TouchableOpacity key={c.id} style={s.catCard}
              onPress={() => navigation.navigate('Products', { category: c.slug, categoryName: c.name })}>
              <View style={[s.catIcon, { backgroundColor: ['#e3f2fd','#fce4ec','#e8f5e9','#fff3e0','#f3e5f5','#e0f7fa'][i % 6] }]}>
                <Text style={{ fontSize: 28 }}>{c.image && c.image.startsWith('/') ? '📁' : (c.image || catIcons[i % catIcons.length])}</Text>
              </View>
              <Text style={s.catName} numberOfLines={1}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>🛍️ Just For You</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={s.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>
        <View style={s.productGrid}>
          {products.map(p => (
            <ProductCard key={p.id} product={p}
              onPress={() => navigation.navigate('ProductDetail', { id: p.id })} />
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT },
  bannerWrap: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  bannerSlide: { height: 180, borderRadius: 12, overflow: 'hidden' },
  bannerImg: { width: '100%', height: '100%', borderRadius: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db', marginHorizontal: 3 },
  dotActive: { backgroundColor: PRIMARY, width: 18 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  seeAll: { fontSize: 14, color: PRIMARY, fontWeight: '600' },
  catCard: { alignItems: 'center', width: 72 },
  catIcon: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catName: { fontSize: 11, fontWeight: '600', color: DARK, textAlign: 'center' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  cardImgWrap: { position: 'relative', width: '100%', height: 160 },
  cardImg: { width: '100%', height: '100%' },
  noImg: { justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: SECONDARY, color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 8 },
  cardName: { fontSize: 13, fontWeight: '500', color: DARK, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 15, fontWeight: '700', color: PRIMARY },
  comparePrice: { fontSize: 12, color: GRAY, textDecorationLine: 'line-through' },
});
