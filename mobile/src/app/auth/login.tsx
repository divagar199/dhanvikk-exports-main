import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/constants/theme';

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const submit = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Missing Details', 'Please enter your email and password.');
    }
    setBusy(true);
    try {
      const r = await login(email.trim(), password);
      setUser(r.user);
      Alert.alert('Welcome!', `Logged in as ${r.user?.name || email.trim()}`);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message || 'Please check your credentials and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.topBar}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.eyebrow}>DHANVIKK BLOOMS</Text>
          <Text style={s.title}>Welcome back.</Text>
          <Text style={s.sub}>
            Sign in to manage your blooms, track orders and save your delivery addresses.
          </Text>

          <Text style={s.label}>Email Address</Text>
          <TextInput
            style={s.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="name@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>Password</Text>
          <View style={s.passwordBox}>
            <TextInput
              style={s.passwordInput}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <Pressable
            style={[s.button, busy && s.buttonDisabled]}
            onPress={submit}
            disabled={busy}
          >
            <Text style={s.buttonText}>{busy ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/auth/register')} style={s.linkWrap}>
            <Text style={s.link}>New to Dhanvikk? <Text style={s.linkBold}>Create an account</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  eyebrow: {
    color: colors.primaryDeep,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
  },
  sub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 14,
  },
  passwordBox: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  eyeBtn: {
    padding: 4,
  },
  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  linkWrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  link: {
    color: colors.muted,
    fontSize: 14,
  },
  linkBold: {
    color: colors.primaryDeep,
    fontWeight: '800',
  },
});