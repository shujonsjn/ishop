import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator
} from 'react-native';
import { api } from '../api/client';

const PRIMARY = '#7c3aed';
const SECONDARY = '#e91e63';
const DARK = '#1e293b';
const GRAY = '#94a3b8';
const LIGHT = '#f8fafc';
const BORDER = '#e2e8f0';

function ProductCard({ product, onPress }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100) : 0;
  let img = '';
  if (product.color_images) {
    const ci = typeof product.color_images === 'string' ? JSON.parse(product.color_images) : product.color_images;
    const fc = Object.keys(ci)[0];
    if (ci[fc] && ci[fc].length) img = ci[fc][0];
  }
  if (!img && product.images && product.images.length) img = product.images[0];

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardImgWrap}>
        {discount > 0 && <View style={s.discountBadge}><Text style={s.discountText}>-{discount}%</Text></View>}
        {img ? <Image source={{ uri: 'http://10.0.2.2:3001' + img }} style={s.cardImg} resizeMode="cover" /> :
          <View style={[s.cardImg, s.noImg]}><Text style={{ fontSize: 32 }}>📷</Text></View>}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{product.name || product.en_name}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>৳{Number(product.price).toLocaleString('en-US')}</Text>
          {product.compare_price > 0 && <Text style={s.comparePrice}>৳{Number(product.compare_price).toLocaleString('en-US')}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen({ navigation, route }) {
  const category = route?.params?.category || '';
  const categoryName = route?.params?.categoryName || '';
  const searchQuery = route?.params?.search || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      let url = '/products?page=' + p + '&limit=20';
      if (category) url += '&category=' + encodeURIComponent(category);
      if (search) url += '&search=' + encodeURIComponent(search);
      const data = await api('GET', url);
      const items = data.products || data || [];
      setProducts(p === 1 ? items : [...products, ...items]);
      setTotal(data.total || items.length);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(1); setPage(1); }, [category, searchQuery]);

  const loadMore = () => {
    if (products.length >= total) return;
    const next = page + 1;
    setPage(next);
    load(next);
  };

  return (
    <View style={s.container}>
      <View style={s.searchBar}>
        <TextInput style={s.searchInput} placeholder="Search products..." value={search}
          onChangeText={setSearch} onSubmitEditing={() => { setPage(1); load(1); }}
          returnKeyType="search" />
      </View>
      {categoryName ? <Text style={s.catTitle}>{categoryName}</Text> : null}
      <Text style={s.count}>{total} products</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />
        )}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 20 }} color={PRIMARY} /> :
          products.length < total ? (
            <TouchableOpacity style={s.loadMore} onPress={loadMore}>
              <Text style={s.loadMoreText}>Show More</Text>
            </TouchableOpacity>
          ) : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT },
  searchBar: { padding: 12, paddingBottom: 0 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  catTitle: { fontSize: 18, fontWeight: '700', color: DARK, paddingHorizontal: 12, marginTop: 8 },
  count: { fontSize: 13, color: GRAY, paddingHorizontal: 12, marginTop: 4, marginBottom: 4 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  cardImgWrap: { position: 'relative', width: '100%', height: 160 },
  cardImg: { width: '100%', height: '100%' },
  noImg: { justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: SECONDARY, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 8 },
  cardName: { fontSize: 13, fontWeight: '500', color: DARK, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 15, fontWeight: '700', color: PRIMARY },
  comparePrice: { fontSize: 12, color: GRAY, textDecorationLine: 'line-through' },
  loadMore: { backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  loadMoreText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
