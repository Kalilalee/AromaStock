import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Check, ChevronRight, Heart, Minus, PackageCheck, PackageSearch, Pencil, ShoppingBag, ShoppingCart, Trash2, UserRound, X } from 'lucide-react-native';
import ActionButton from '../components/ActionButton';
import StoreProductCard from '../components/StoreProductCard';
import TextField from '../components/TextField';
import { formatPrice, getImageSource } from '../data/perfumes';
import { colors, radii } from '../theme';

const TABS = [
  { id: 'products', label: 'Productos', icon: PackageSearch },
  { id: 'cart', label: 'Carrito', icon: ShoppingCart },
  { id: 'profile', label: 'Perfil', icon: UserRound },
];

function CartLine({ perfume, quantity, onChangeQuantity, onOpen }) {
  const imageSource = getImageSource(perfume.image);

  return (
    <View style={styles.cartLine}>
      <TouchableOpacity accessibilityRole="button" onPress={onOpen} style={styles.cartProduct}>
        <View style={styles.cartImageFrame}>
          {imageSource ? <Image source={imageSource} resizeMode="contain" style={styles.cartImage} /> : null}
        </View>
        <View style={styles.cartCopy}>
          <Text style={styles.cartBrand}>{perfume.brand.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.cartName}>{perfume.name}</Text>
          <Text style={styles.cartPrice}>{formatPrice(perfume.storePrice)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          accessibilityLabel={quantity === 1 ? `Quitar ${perfume.name} del carrito` : `Quitar una unidad de ${perfume.name}`}
          accessibilityRole="button"
          onPress={() => onChangeQuantity(Math.max(0, quantity - 1))}
          style={styles.quantityButton}
        >
          {quantity === 1 ? <Trash2 color={colors.wine} size={15} /> : <Minus color={colors.wine} size={15} />}
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          accessibilityLabel={`Agregar una unidad de ${perfume.name}`}
          accessibilityRole="button"
          onPress={() => onChangeQuantity(quantity + 1)}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityPlus}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen({
  navigation,
  user,
  perfumes,
  cart,
  favoriteIds = user.favoriteIds ?? [],
  orders = user.orders ?? [],
  onAddToCart,
  onSetCartQuantity,
  onToggleFavorite,
  onCreateOrder,
  onUpdateProfile,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('products');
  const [profileView, setProfileView] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.username);
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [orderNotice, setOrderNotice] = useState(false);
  const [orderToast, setOrderToast] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const toastOffset = useRef(new Animated.Value(72)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const products = perfumes;
  const cartLines = useMemo(() => cart
    .map((item) => ({
      ...item,
      perfume: perfumes.find((perfume) => perfume.id === item.perfumeId),
    }))
    .filter((item) => item.perfume && typeof item.perfume.storePrice === 'number'), [cart, perfumes]);
  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartLines.reduce((sum, item) => sum + item.perfume.storePrice * item.quantity, 0);
  const previousCartCount = useRef(cartCount);

  useEffect(() => {
    setNameDraft(user.username);
  }, [user.username]);

  useEffect(() => {
    if (orderNotice && cartCount > 0 && previousCartCount.current === 0) {
      setOrderNotice(false);
      setOrderToast(false);
      setLastOrder(null);
    }
    previousCartCount.current = cartCount;
  }, [cartCount, orderNotice]);

  useEffect(() => {
    if (!orderToast) return undefined;

    Animated.parallel([
      Animated.spring(toastOffset, { toValue: 0, damping: 18, stiffness: 180, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOffset, { toValue: 72, duration: 180, useNativeDriver: true }),
        Animated.timing(toastOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setOrderToast(false);
      });
    }, 2600);

    return () => {
      clearTimeout(timeout);
      toastOffset.stopAnimation();
      toastOpacity.stopAnimation();
    };
  }, [orderToast, toastOffset, toastOpacity]);

  function selectTab(tab) {
    if (tab === 'profile') {
      setProfileView('overview');
      setEditingProfile(false);
      setProfileError('');
    }
    if (activeTab === 'cart' && tab !== 'cart') {
      setOrderNotice(false);
      setOrderToast(false);
      setLastOrder(null);
    } else if (tab === 'cart' && activeTab !== 'cart' && orderNotice) {
      setOrderNotice(false);
    }
    setActiveTab(tab);
  }

  function addProductToCart(perfumeId) {
    setOrderNotice(false);
    setOrderToast(false);
    setLastOrder(null);
    onAddToCart(perfumeId);
  }

  function completeOrder() {
    if (!cartLines.length) return;

    const order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      count: cartCount,
      total: cartTotal,
      items: cartLines.map(({ perfume, quantity }) => ({
        perfumeId: perfume.id,
        name: perfume.name,
        brand: perfume.brand,
        quantity,
        unitPrice: perfume.storePrice,
      })),
    };
    onCreateOrder(order);
    setLastOrder(order);
    setOrderNotice(true);
    setOrderToast(true);
    cartLines.forEach(({ perfume }) => onSetCartQuantity(perfume.id, 0));
  }

  function renderProducts() {
    const rows = [];
    for (let index = 0; index < products.length; index += 2) {
      rows.push(products.slice(index, index + 2));
    }

    return (
      <>
        <View style={styles.pageHeading}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>AROMA STOCK</Text>
            <Text style={styles.heading}>Perfumes</Text>
          </View>
          <View style={styles.productCount}>
            <Text style={styles.productCountValue}>{products.length}</Text>
            <Text style={styles.productCountLabel}>PRODUCTOS</Text>
          </View>
        </View>
        {rows.length ? (
          <View style={styles.productGrid}>
            {rows.map((row, index) => (
              <View key={`product-row-${index}`} style={styles.productRow}>
                {row.map((perfume) => {
                  const cartLine = cartLines.find((item) => item.perfumeId === perfume.id);
                  return (
                    <StoreProductCard
                      key={perfume.id}
                      cartQuantity={cartLine?.quantity ?? 0}
                      onAddToCart={() => addProductToCart(perfume.id)}
                      onPress={() => navigation.navigate('PerfumeDetails', { perfumeId: perfume.id })}
                      favorite={favoriteIds.includes(perfume.id)}
                      onToggleFavorite={() => onToggleFavorite(perfume.id)}
                      perfume={perfume}
                    />
                  );
                })}
                {row.length === 1 ? <View style={styles.gridPlaceholder} /> : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <PackageSearch color={colors.sage} size={27} />
            <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
          </View>
        )}
      </>
    );
  }

  function renderCart() {
    return (
      <>
        <View style={styles.pageHeading}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>TU PEDIDO</Text>
            <Text style={styles.heading}>Carrito</Text>
          </View>
          <Text style={styles.cartCount}>{cartCount} {cartCount === 1 ? 'unidad' : 'unidades'}</Text>
        </View>

        {cartLines.length ? (
          <>
            {cartLines.map(({ perfume, quantity }) => (
              <CartLine
                key={perfume.id}
                onChangeQuantity={(value) => onSetCartQuantity(perfume.id, value)}
                onOpen={() => navigation.navigate('PerfumeDetails', { perfumeId: perfume.id })}
                perfume={perfume}
                quantity={quantity}
              />
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
            </View>
            <ActionButton
              onPress={completeOrder}
              title="Continuar"
              style={styles.continueButton}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <ShoppingBag color={colors.sage} size={27} />
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => selectTab('products')} style={styles.emptyAction}>
              <Text style={styles.emptyLink}>Ver productos</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }

  async function saveProfileName() {
    setProfileSaving(true);
    setProfileError('');
    const result = await onUpdateProfile({ username: nameDraft });
    setProfileSaving(false);
    if (!result?.ok) {
      setProfileError(result?.error ?? 'No se pudo guardar el nombre. Probá otra vez.');
      return;
    }
    setEditingProfile(false);
  }

  async function chooseProfilePhoto() {
    setProfileError('');
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setProfileError('Necesitás permitir el acceso a tus fotos para elegir una imagen.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      const avatarUri = result.canceled ? null : result.assets?.[0]?.uri;
      if (!avatarUri) return;

      setProfileSaving(true);
      const saved = await onUpdateProfile({ avatarUri });
      if (!saved?.ok) setProfileError(saved?.error ?? 'No se pudo guardar la foto. Probá otra vez.');
      setProfileSaving(false);
    } catch {
      setProfileSaving(false);
      Alert.alert('No se pudo abrir la galería', 'Revisá los permisos de fotos e intentá otra vez.');
    }
  }

  function renderProfileHeading(title, onBack) {
    return (
      <View style={styles.pageHeading}>
        {onBack ? (
          <TouchableOpacity accessibilityLabel="Volver al perfil" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <ArrowLeft color={colors.wineDark} size={19} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>AROMA STOCK</Text>
          <Text style={styles.heading}>{title}</Text>
        </View>
      </View>
    );
  }

  function renderProfile() {
    if (profileView === 'favorites') {
      const favoriteProducts = products.filter((perfume) => favoriteIds.includes(perfume.id));
      const rows = [];
      for (let index = 0; index < favoriteProducts.length; index += 2) {
        rows.push(favoriteProducts.slice(index, index + 2));
      }

      return (
        <>
          {renderProfileHeading('Favoritos', () => setProfileView('overview'))}
          {rows.length ? (
            <View style={styles.productGrid}>
              {rows.map((row, index) => (
                <View key={`favorite-row-${index}`} style={styles.productRow}>
                  {row.map((perfume) => {
                    const cartLine = cartLines.find((item) => item.perfumeId === perfume.id);
                    return (
                      <StoreProductCard
                        key={perfume.id}
                        cartQuantity={cartLine?.quantity ?? 0}
                        favorite
                        onAddToCart={() => addProductToCart(perfume.id)}
                        onPress={() => navigation.navigate('PerfumeDetails', { perfumeId: perfume.id })}
                        onToggleFavorite={() => onToggleFavorite(perfume.id)}
                        perfume={perfume}
                      />
                    );
                  })}
                  {row.length === 1 ? <View style={styles.gridPlaceholder} /> : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Heart color={colors.sage} size={27} />
              <Text style={styles.emptyTitle}>Todavía no guardaste favoritos</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => selectTab('products')} style={styles.emptyAction}>
                <Text style={styles.emptyLink}>Explorar productos</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }

    if (profileView === 'orders') {
      return (
        <>
          {renderProfileHeading('Mis pedidos', () => setProfileView('overview'))}
          {orders.length ? (
            <View style={styles.orderList}>
              {orders.map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderTitleCopy}>
                      <Text style={styles.orderTitle}>Pedido realizado</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  </View>
                  <View style={styles.orderDivider} />
                  {order.items.map((item) => (
                    <View key={`${order.id}-${item.perfumeId}`} style={styles.orderLine}>
                      <Text numberOfLines={2} style={styles.orderProductName}>
                        {item.quantity} x {item.name}
                      </Text>
                      <Text style={styles.orderLineTotal}>{formatPrice(item.unitPrice * item.quantity)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <PackageCheck color={colors.sage} size={27} />
              <Text style={styles.emptyTitle}>Todavía no tenés pedidos</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => selectTab('products')} style={styles.emptyAction}>
                <Text style={styles.emptyLink}>Ver productos</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }

    const initial = user.username.trim().charAt(0).toUpperCase() || '?';

    return (
      <>
        {renderProfileHeading('Perfil')}
        <View style={styles.profileRow}>
          <TouchableOpacity
            accessibilityLabel="Cambiar foto de perfil"
            accessibilityRole="button"
            disabled={profileSaving}
            onPress={chooseProfilePhoto}
            style={styles.avatarButton}
          >
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
            )}
            <View style={styles.cameraBadge}><Camera color={colors.white} size={12} /></View>
          </TouchableOpacity>
          {editingProfile ? (
            <View style={styles.profileEdit}>
              <TextField
                autoCapitalize="none"
                autoCorrect={false}
                label="Nombre de usuario"
                onChangeText={setNameDraft}
                onSubmitEditing={saveProfileName}
                placeholder="Tu nombre"
                returnKeyType="done"
                value={nameDraft}
              />
              <View style={styles.profileEditActions}>
                <TouchableOpacity
                  accessibilityLabel="Cancelar edición del perfil"
                  accessibilityRole="button"
                  onPress={() => { setEditingProfile(false); setNameDraft(user.username); setProfileError(''); }}
                  style={styles.editIconButton}
                >
                  <X color={colors.muted} size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Guardar nombre"
                  accessibilityRole="button"
                  disabled={profileSaving}
                  onPress={saveProfileName}
                  style={styles.saveIconButton}
                >
                  <Check color={colors.white} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{user.username}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => { setEditingProfile(true); setProfileError(''); }}
                style={styles.editNameButton}
              >
                <Pencil color={colors.wine} size={13} />
                <Text style={styles.editNameText}>Editar nombre</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {profileError ? <Text accessibilityRole="alert" style={styles.profileError}>{profileError}</Text> : null}

        <View style={styles.profileMenu}>
          <TouchableOpacity accessibilityLabel={`Mis pedidos, ${orders.length}`} accessibilityRole="button" onPress={() => setProfileView('orders')} style={styles.profileMenuRow}>
            <View style={styles.profileMenuIcon}><PackageCheck color={colors.wine} size={18} /></View>
            <View style={styles.profileMenuCopy}>
              <Text style={styles.profileMenuTitle}>Mis pedidos</Text>
              <Text style={styles.profileMenuDetail}>{orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}</Text>
            </View>
            <ChevronRight color={colors.muted} size={18} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel={`Favoritos, ${favoriteIds.length}`} accessibilityRole="button" onPress={() => setProfileView('favorites')} style={styles.profileMenuRow}>
            <View style={styles.profileMenuIcon}><Heart color={colors.wine} size={18} /></View>
            <View style={styles.profileMenuCopy}>
              <Text style={styles.profileMenuTitle}>Favoritos</Text>
              <Text style={styles.profileMenuDetail}>{favoriteIds.length} {favoriteIds.length === 1 ? 'producto guardado' : 'productos guardados'}</Text>
            </View>
            <ChevronRight color={colors.muted} size={18} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileActions}>
          <ActionButton onPress={onLogout} title="Cerrar sesión" variant="outline" />
        </View>
      </>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Image
              accessibilityLabel="Perfume"
              resizeMode="contain"
              source={require('../../assets/aroma-stock-adaptive-foreground.png')}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brand}>AROMA STOCK</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel={orderNotice ? 'Abrir carrito, pedido realizado' : `Abrir carrito, ${cartCount} productos`}
          accessibilityRole="button"
          onPress={() => selectTab('cart')}
          style={[styles.headerCart, orderNotice && styles.headerCartNotice]}
        >
          <ShoppingCart color={orderNotice ? colors.sage : colors.wineDark} size={20} />
          {orderNotice ? (
            <View style={styles.successBadge}><Check color={colors.sage} size={10} /></View>
          ) : cartCount > 0 ? <View style={styles.topCartBadge}><Text style={styles.topCartBadgeText}>{cartCount}</Text></View> : null}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'products' ? renderProducts() : null}
        {activeTab === 'cart' ? renderCart() : null}
        {activeTab === 'profile' ? renderProfile() : null}
      </ScrollView>

      {orderToast && lastOrder ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={[styles.orderToast, { opacity: toastOpacity, transform: [{ translateY: toastOffset }] }]}
        >
          <View style={styles.orderCheck}><Check color={colors.sage} size={19} /></View>
          <View style={styles.toastCopy}>
            <Text style={styles.toastTitle}>Pedido realizado</Text>
            <Text style={styles.toastDetail}>
              {lastOrder.count} {lastOrder.count === 1 ? 'producto' : 'productos'} · Total {formatPrice(lastOrder.total)}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.bottomNav}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = activeTab === id;
          return (
            <TouchableOpacity
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={id === 'cart' && orderNotice ? `${label}, pedido realizado` : id === 'cart' && cartCount > 0 ? `${label}, ${cartCount} productos` : label}
              onPress={() => selectTab(id)}
              style={styles.navItem}
            >
              <View style={styles.navIconFrame}>
                <Icon color={id === 'cart' && orderNotice ? colors.sage : selected ? colors.wineDark : colors.muted} size={21} strokeWidth={selected ? 2.3 : 1.8} />
                {id === 'cart' && orderNotice ? (
                  <View style={styles.successBadge}><Check color={colors.sage} size={9} /></View>
                ) : id === 'cart' && cartCount > 0 ? <View style={styles.navBadge}><Text style={styles.navBadgeText}>{cartCount}</Text></View> : null}
              </View>
              <Text numberOfLines={1} style={[styles.navLabel, selected && styles.navLabelSelected]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22 },
  topbar: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.background },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 33, height: 33, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.wineDark },
  logoImage: { width: 33, height: 33 },
  brand: { color: colors.wineDark, fontSize: 11, fontWeight: '900' },
  headerCart: { width: 40, height: 40, position: 'relative', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  topCartBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 9, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral },
  topCartBadgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  pageHeading: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.sage, fontSize: 9, fontWeight: '800' },
  heading: { color: colors.ink, fontFamily: 'Georgia', fontSize: 27, lineHeight: 34, marginTop: 2 },
  productCount: { minWidth: 70, minHeight: 46, borderRadius: radii.medium, backgroundColor: colors.sageLight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 5 },
  productCountValue: { color: colors.sage, fontFamily: 'Georgia', fontSize: 19, lineHeight: 22 },
  productCountLabel: { color: colors.sage, fontSize: 7, fontWeight: '800', marginTop: 1 },
  productGrid: { gap: 12 },
  productRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  gridPlaceholder: { flex: 1 },
  cartCount: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  cartLine: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 10, marginBottom: 9, borderWidth: 1, borderColor: colors.line, borderRadius: radii.medium, backgroundColor: colors.surface },
  cartProduct: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
  cartImageFrame: { width: 68, height: 88, flexShrink: 0, overflow: 'hidden', borderRadius: radii.small, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  cartImage: { width: 68, height: 88 },
  cartCopy: { flex: 1, minWidth: 0 },
  cartBrand: { color: colors.sage, fontSize: 8, fontWeight: '800' },
  cartName: { color: colors.ink, fontSize: 14, lineHeight: 18, fontWeight: '700', marginTop: 3 },
  cartPrice: { color: colors.sage, fontSize: 14, fontWeight: '800', marginTop: 5 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  quantityButton: { width: 31, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.roseLight },
  quantityPlus: { color: colors.wine, fontSize: 20, lineHeight: 22, fontWeight: '500' },
  quantity: { minWidth: 15, color: colors.ink, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 6 },
  totalLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  totalValue: { color: colors.sage, fontSize: 20, fontWeight: '800' },
  continueButton: { marginTop: 8 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32, borderWidth: 1, borderColor: colors.line, borderRadius: radii.medium, backgroundColor: colors.surface },
  orderToast: { position: 'absolute', left: 16, right: 16, bottom: 72, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.medium, borderWidth: 1, borderColor: colors.sageLight, backgroundColor: colors.sageLight },
  orderCheck: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  toastCopy: { flex: 1, minWidth: 0 },
  toastTitle: { color: colors.sage, fontSize: 13, fontWeight: '800' },
  toastDetail: { color: colors.ink, fontSize: 11, lineHeight: 15, marginTop: 2 },
  emptyTitle: { color: colors.ink, fontFamily: 'Georgia', fontSize: 18, textAlign: 'center', marginTop: 12 },
  emptyAction: { minHeight: 40, justifyContent: 'center' },
  emptyLink: { color: colors.wine, fontSize: 13, fontWeight: '800', marginTop: 6 },
  backButton: { width: 38, height: 38, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: radii.small, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  profileRow: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, borderWidth: 1, borderColor: colors.line, borderRadius: radii.medium, backgroundColor: colors.surface },
  avatarButton: { width: 64, height: 64, position: 'relative', flexShrink: 0 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.roseLight },
  avatarText: { color: colors.wineDark, fontFamily: 'Georgia', fontSize: 22 },
  cameraBadge: { position: 'absolute', right: -1, bottom: -1, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.wine },
  profileCopy: { flex: 1, minWidth: 0 },
  profileName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  editNameButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  editNameText: { color: colors.wine, fontSize: 12, fontWeight: '700' },
  profileEdit: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  profileEditActions: { flexDirection: 'row', gap: 6, paddingBottom: 1 },
  editIconButton: { width: 38, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radii.small, backgroundColor: colors.background },
  saveIconButton: { width: 38, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radii.small, backgroundColor: colors.sage },
  profileError: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 8, marginHorizontal: 2 },
  profileMenu: { marginTop: 17, borderTopWidth: 1, borderTopColor: colors.line },
  profileMenuRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileMenuIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radii.small, backgroundColor: colors.roseLight },
  profileMenuCopy: { flex: 1, minWidth: 0, gap: 3 },
  profileMenuTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  profileMenuDetail: { color: colors.muted, fontSize: 11 },
  profileActions: { marginTop: 19 },
  orderList: { gap: 10 },
  orderItem: { padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: radii.medium, backgroundColor: colors.surface },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  orderTitleCopy: { flex: 1, minWidth: 0, gap: 3 },
  orderTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  orderDate: { color: colors.muted, fontSize: 11 },
  orderTotal: { color: colors.sage, fontSize: 15, fontWeight: '800' },
  orderDivider: { height: 1, backgroundColor: colors.line, marginVertical: 11 },
  orderLine: { minHeight: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  orderProductName: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 17 },
  orderLineTotal: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  bottomNav: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 5, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  navItem: { flex: 1, minWidth: 0, minHeight: 53, alignItems: 'center', justifyContent: 'center', gap: 2 },
  navIconFrame: { width: 29, height: 25, alignItems: 'center', justifyContent: 'center' },
  navLabel: { maxWidth: '100%', color: colors.muted, fontSize: 10, fontWeight: '600' },
  navLabelSelected: { color: colors.wineDark, fontWeight: '800' },
  navBadge: { position: 'absolute', top: -3, right: -4, minWidth: 14, height: 14, borderRadius: 8, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral },
  navBadgeText: { color: colors.white, fontSize: 8, fontWeight: '800' },
  headerCartNotice: { backgroundColor: colors.sageLight, borderColor: colors.sageLight },
  successBadge: { position: 'absolute', top: -3, right: -4, width: 15, height: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sageLight, borderWidth: 1, borderColor: colors.white },
});
