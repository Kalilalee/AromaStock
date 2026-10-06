import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthenticationScreen from './src/screens/AuthenticationScreen';
import HomeScreen from './src/screens/HomeScreen';
import PerfumeDetailsScreen from './src/screens/PerfumeDetailsScreen';
import { INITIAL_PERFUMES } from './src/data/perfumes';
import { authenticateLocalUser, createLocalAccount } from './src/lib/auth';
import { colors } from './src/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const USERS_KEY = '@aroma-stock/users';
const SESSION_KEY = '@aroma-stock/session';
const CART_KEY = '@aroma-stock/cart';
const PRODUCT_IDS = new Set(INITIAL_PERFUMES.map(({ id }) => id));

function normalizeUserRecord(record) {
  return {
    id: record.id,
    username: record.username,
    password: record.password,
    avatarUri: typeof record.avatarUri === 'string' ? record.avatarUri : null,
    favoriteIds: Array.isArray(record.favoriteIds)
      ? record.favoriteIds.filter((id) => PRODUCT_IDS.has(id))
      : [],
    orders: Array.isArray(record.orders) ? record.orders : [],
  };
}

function toProfileUser(record) {
  const normalized = normalizeUserRecord(record);
  return {
    id: normalized.id,
    username: normalized.username,
    avatarUri: normalized.avatarUri,
    favoriteIds: normalized.favoriteIds,
    orders: normalized.orders,
  };
}

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const storedValues = await AsyncStorage.multiGet([USERS_KEY, SESSION_KEY, CART_KEY]);
        const values = Object.fromEntries(storedValues);
        const savedUsers = values[USERS_KEY] ? JSON.parse(values[USERS_KEY]) : [];
        const savedSession = values[SESSION_KEY] ? JSON.parse(values[SESSION_KEY]) : null;
        const savedCart = values[CART_KEY] ? JSON.parse(values[CART_KEY]) : [];

        if (!active) return;
        const restoredUsers = Array.isArray(savedUsers) ? savedUsers.map(normalizeUserRecord) : [];
        setUsers(restoredUsers);
        setCart(Array.isArray(savedCart)
          ? savedCart.filter((item) => PRODUCT_IDS.has(item?.perfumeId) && Number.isInteger(item.quantity) && item.quantity > 0)
          : []);
        const sessionUser = restoredUsers.length
          ? restoredUsers.find((item) => item.id === savedSession?.id)
          : null;
        setUser(sessionUser ? toProfileUser(sessionUser) : null);
      } catch {
        if (active) {
          setUsers([]);
          setCart([]);
          setUser(null);
        }
      } finally {
        if (active) setReady(true);
      }
    }

    restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(USERS_KEY, JSON.stringify(users)).catch(() => {});
  }, [users, ready]);

  async function register(username, password, confirmation) {
    const result = createLocalAccount(users, username, password, confirmation);
    if (result.error) return { ok: false, error: result.error };

    const userRecord = normalizeUserRecord(result.user);
    const updatedUsers = result.users.map((item) => item.id === userRecord.id ? userRecord : item);
    const currentUser = toProfileUser(userRecord);
    await AsyncStorage.multiSet([
      [USERS_KEY, JSON.stringify(updatedUsers)],
      [SESSION_KEY, JSON.stringify({ id: currentUser.id, username: currentUser.username })],
    ]);
    setUsers(updatedUsers);
    setUser(currentUser);
    return { ok: true };
  }

  async function login(username, password) {
    const savedUser = authenticateLocalUser(users, username, password);
    if (!savedUser) return { ok: false, error: 'Usuario o contraseña incorrectos.' };

    const currentUser = toProfileUser(savedUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ id: currentUser.id, username: currentUser.username }));
    setUser(currentUser);
    return { ok: true };
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  async function updateProfile(changes) {
    if (!user) return { ok: false, error: 'No hay una sesión activa.' };

    const username = typeof changes.username === 'string' ? changes.username.trim() : user.username;
    if (!username) return { ok: false, error: 'El nombre no puede quedar vacío.' };
    if (users.some((item) => item.id !== user.id && item.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'Ese nombre ya está en uso.' };
    }

    const updates = { ...changes, username };
    const updatedUsers = users.map((item) => item.id === user.id ? { ...item, ...updates } : item);
    const updatedUser = toProfileUser({ ...user, ...updates });

    try {
      await AsyncStorage.multiSet([
        [USERS_KEY, JSON.stringify(updatedUsers)],
        [SESSION_KEY, JSON.stringify({ id: updatedUser.id, username: updatedUser.username })],
      ]);
    } catch {
      return { ok: false, error: 'No se pudieron guardar los cambios. Probá otra vez.' };
    }

    setUsers(updatedUsers);
    setUser(updatedUser);
    return { ok: true };
  }

  function toggleFavorite(perfumeId) {
    if (!user) return;

    const favoriteIds = user.favoriteIds.includes(perfumeId)
      ? user.favoriteIds.filter((id) => id !== perfumeId)
      : [...user.favoriteIds, perfumeId];
    const updatedUser = { ...user, favoriteIds };
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, favoriteIds } : item));
    setUser(updatedUser);
  }

  function createOrder(order) {
    if (!user) return;

    const orders = [order, ...user.orders].slice(0, 50);
    const updatedUser = { ...user, orders };
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, orders } : item));
    setUser(updatedUser);
  }

  function addToCart(id) {
    setCart((current) => {
      const existing = current.find((item) => item.perfumeId === id);
      return existing
        ? current.map((item) => item.perfumeId === id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { perfumeId: id, quantity: 1 }];
    });
  }

  function setCartQuantity(id, quantity) {
    setCart((current) => quantity <= 0
      ? current.filter((item) => item.perfumeId !== id)
      : current.map((item) => item.perfumeId === id ? { ...item, quantity } : item));
  }

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.wine} size="large" />
          <Text style={styles.loadingText}>AROMA STOCK</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: user ? colors.background : colors.wineDark }]}>
        <StatusBar style={user ? 'dark' : 'light'} />
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator key={user ? 'app' : 'auth'} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            {user ? (
              <>
                <Stack.Screen name="Home">
                  {(props) => <HomeScreen {...props} user={user} perfumes={INITIAL_PERFUMES} cart={cart} orders={user.orders} favoriteIds={user.favoriteIds} onAddToCart={addToCart} onSetCartQuantity={setCartQuantity} onToggleFavorite={toggleFavorite} onCreateOrder={createOrder} onUpdateProfile={updateProfile} onLogout={logout} />}
                </Stack.Screen>
                <Stack.Screen name="PerfumeDetails">
                  {(props) => <PerfumeDetailsScreen {...props} perfumes={INITIAL_PERFUMES} cart={cart} onAddToCart={addToCart} />}
                </Stack.Screen>
              </>
            ) : (
              <>
                <Stack.Screen name="Login">
                  {(props) => <AuthenticationScreen {...props} onLogin={login} onRegister={register} />}
                </Stack.Screen>
                <Stack.Screen name="Register">
                  {(props) => <AuthenticationScreen {...props} onLogin={login} onRegister={register} />}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.background },
  loadingText: { color: colors.wineDark, fontSize: 10, fontWeight: '900' },
});
