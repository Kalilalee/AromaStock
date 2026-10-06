import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import ActionButton from '../components/ActionButton';
import { formatPrice, getImageSource } from '../data/perfumes';
import { colors, radii } from '../theme';

export default function PerfumeDetailsScreen({ navigation, route, perfumes, cart = [], onAddToCart }) {
  const perfume = perfumes.find((item) => item.id === route.params?.perfumeId);

  if (!perfume) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Este producto ya no está disponible.</Text>
        <ActionButton onPress={() => navigation.goBack()} title="Volver a productos" />
      </View>
    );
  }

  const imageSource = getImageSource(perfume.image);
  const cartQuantity = cart.find((item) => item.perfumeId === perfume.id)?.quantity ?? 0;

  function addToCart() {
    onAddToCart(perfume.id);
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Volver a productos" accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={colors.wineDark} size={20} />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>PRODUCTO</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.imageFrame}>
          {imageSource ? <Image source={imageSource} resizeMode="contain" style={styles.image} /> : null}
        </View>

        <View style={styles.productCopy}>
          <Text style={styles.brand}>{perfume.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{perfume.name}</Text>
          <Text style={styles.presentation}>{perfume.presentation}</Text>
          <Text style={styles.family}>{perfume.family}</Text>
          <Text style={styles.description}>{perfume.summary}</Text>
        </View>

        <View style={styles.purchasePanel}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>PRECIO</Text>
              <Text style={styles.price}>{formatPrice(perfume.storePrice)}</Text>
            </View>
          </View>
          {cartQuantity > 0 ? <Text style={styles.cartStatus}>En el carrito: {cartQuantity}</Text> : null}
          <ActionButton icon={ShoppingCart} onPress={addToCart} title="Agregar al carrito" style={styles.addButton} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 },
  header: { minHeight: 43, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  headerLabel: { flex: 1, textAlign: 'center', color: colors.sage, fontSize: 9, fontWeight: '800' },
  headerSpace: { width: 40 },
  imageFrame: { width: '100%', aspectRatio: 1.05, overflow: 'hidden', borderRadius: radii.medium, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  image: { width: '100%', height: '100%' },
  productCopy: { paddingTop: 17 },
  brand: { color: colors.sage, fontSize: 10, fontWeight: '800' },
  name: { color: colors.ink, fontFamily: 'Georgia', fontSize: 27, lineHeight: 34, marginTop: 3 },
  presentation: { color: colors.muted, fontSize: 12, marginTop: 5 },
  family: { color: colors.wine, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 12 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
  purchasePanel: { padding: 15, marginTop: 18, borderRadius: radii.medium, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  priceLabel: { color: colors.muted, fontSize: 8, fontWeight: '800' },
  price: { color: colors.sage, fontSize: 22, lineHeight: 28, fontWeight: '800', marginTop: 2 },
  cartStatus: { color: colors.sage, fontSize: 11, fontWeight: '700', marginTop: 8 },
  addButton: { marginTop: 12 },
  missing: { flex: 1, justifyContent: 'center', gap: 18, padding: 24, backgroundColor: colors.background },
  missingText: { color: colors.ink, fontSize: 16 },
});
