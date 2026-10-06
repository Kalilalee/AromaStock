import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Heart, Plus } from 'lucide-react-native';
import { formatPrice, getImageSource } from '../data/perfumes';
import { colors, radii } from '../theme';

export default function StoreProductCard({ perfume, cartQuantity, favorite = false, onPress, onAddToCart, onToggleFavorite }) {
  const imageSource = getImageSource(perfume.image);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityLabel={`Ver detalles de ${perfume.name}`}
        accessibilityRole="button"
        onPress={onPress}
      >
        <View style={styles.imageFrame}>
          {imageSource ? <Image source={imageSource} resizeMode="contain" style={styles.image} /> : null}
          <View style={styles.sizeBadge}><Text style={styles.sizeText}>{perfume.volume ?? '100 ML'}</Text></View>
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.brand}>{perfume.brand.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.name}>{perfume.name}</Text>
          <Text numberOfLines={1} style={styles.presentation}>{perfume.presentation}</Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <View style={styles.priceCopy}>
          <Text style={styles.priceLabel}>PRECIO</Text>
          <Text style={styles.price}>{formatPrice(perfume.storePrice)}</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel={favorite ? `Quitar ${perfume.name} de favoritos` : `Agregar ${perfume.name} a favoritos`}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          onPress={onToggleFavorite}
          style={[styles.favoriteButton, favorite && styles.favoriteSelected]}
        >
          <Heart color={favorite ? colors.wine : colors.muted} fill={favorite ? colors.wine : 'transparent'} size={17} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={cartQuantity ? `Agregar otro ${perfume.name} al carrito` : `Agregar ${perfume.name} al carrito`}
          accessibilityRole="button"
          onPress={onAddToCart}
          style={[styles.addButton, cartQuantity > 0 && styles.addedButton]}
        >
          {cartQuantity > 0 ? <Check color={colors.white} size={18} /> : <Plus color={colors.white} size={19} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, overflow: 'hidden', borderRadius: radii.small, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  imageFrame: { width: '100%', aspectRatio: 0.96, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  image: { width: '100%', height: '100%' },
  sizeBadge: { position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.white },
  sizeText: { color: colors.ink, fontSize: 9, fontWeight: '800' },
  copy: { minHeight: 75, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 4 },
  brand: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 15, lineHeight: 19, fontWeight: '700', marginTop: 3 },
  presentation: { color: colors.muted, fontSize: 10, marginTop: 3 },
  footer: { minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, paddingHorizontal: 9, paddingBottom: 8 },
  priceCopy: { flex: 1, minWidth: 0 },
  priceLabel: { color: colors.muted, fontSize: 7, fontWeight: '800' },
  price: { color: colors.sage, fontSize: 16, lineHeight: 20, fontWeight: '800', marginTop: 2 },
  favoriteButton: { width: 34, height: 38, flexShrink: 0, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  favoriteSelected: { backgroundColor: colors.roseLight },
  addButton: { width: 38, height: 38, flexShrink: 0, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.wine },
  addedButton: { backgroundColor: colors.sage },
});
