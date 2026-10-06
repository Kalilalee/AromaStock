import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Droplets } from 'lucide-react-native';
import ActionButton from '../components/ActionButton';
import TextField from '../components/TextField';
import { colors, radii } from '../theme';

export default function AuthenticationScreen({ route, navigation, onLogin, onRegister }) {
  const isRegister = route.name === 'Register';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  async function submit() {
    setError('');
    setWorking(true);
    try {
      const result = isRegister
        ? await onRegister(username, password, confirmation)
        : await onLogin(username, password);
      if (!result.ok) setError(result.error);
    } catch {
      setError('No se pudo guardar la cuenta en este dispositivo.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandBlock}>
          <View style={styles.brandMark}>
            <Droplets color={colors.gold} size={24} strokeWidth={1.8} />
          </View>
          <Text style={styles.brand}>AROMA STOCK</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              {isRegister ? <Text style={styles.eyebrow}>CREÁ TU CUENTA</Text> : null}
              <Text style={styles.heading}>{isRegister ? 'Crear cuenta' : 'Bienvenido'}</Text>
            </View>
          </View>

          <TextField
            autoCapitalize="none"
            autoComplete="username"
            label="Usuario"
            onChangeText={setUsername}
            placeholder="Tu nombre de usuario"
            returnKeyType="next"
            value={username}
          />
          <TextField
            autoCapitalize="none"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            label="Contraseña"
            onChangeText={setPassword}
            onSubmitEditing={!isRegister ? submit : undefined}
            placeholder="Al menos 6 caracteres"
            returnKeyType={isRegister ? 'next' : 'go'}
            secureTextEntry
            value={password}
          />
          {isRegister ? (
            <TextField
              autoCapitalize="none"
              autoComplete="new-password"
              label="Repetir contraseña"
              onChangeText={setConfirmation}
              onSubmitEditing={submit}
              placeholder="Confirmá tu contraseña"
              returnKeyType="go"
              secureTextEntry
              value={confirmation}
            />
          ) : null}

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

          <ActionButton
            disabled={working}
            onPress={submit}
            title={working ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Ingresar'}
            style={styles.submit}
          />
          {working ? <ActivityIndicator color={colors.wine} style={styles.spinner} /> : null}

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes una cuenta?'}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setError('');
                navigation.navigate(isRegister ? 'Login' : 'Register');
              }}
            >
              <Text style={styles.switchAction}>{isRegister ? 'Ingresar' : 'Registrarme'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.wineDark },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingTop: 38, paddingBottom: 26 },
  brandBlock: { alignItems: 'center', marginBottom: 25 },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  brand: { color: colors.white, fontSize: 12, fontWeight: '800', marginTop: 12 },
  form: { padding: 20, borderRadius: radii.large, backgroundColor: colors.background, gap: 15 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.sage, fontSize: 10, fontWeight: '800' },
  heading: { color: colors.ink, fontFamily: 'Georgia', fontSize: 29, marginTop: 4 },
  submit: { marginTop: 2 },
  spinner: { marginTop: -4 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  switchText: { color: colors.muted, fontSize: 13 },
  switchAction: { color: colors.wine, fontSize: 13, fontWeight: '800' },
});
