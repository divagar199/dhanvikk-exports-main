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
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/constants/theme';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';
import { useToast } from '@/context/ToastContext';

const brandLogo = require('@/assets/logo.png');

export default function Login() {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const submit = async () => {
    if (!email.trim() || !password) {
      return showToast('Missing Details', 'Please enter your email and password.', 'error');
    }
    setBusy(true);
    try {
      const r = await login(email.trim(), password);
      setUser(r.user);
      showToast(
        r.isNewAccount ? 'Account Created! 🌸' : 'Welcome back! 🌸',
        r.message || `Logged in as ${r.user?.name || email.trim()}`,
        'success'
      );
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      showToast('Sign In Failed', e.message || 'Please check your credentials and try again.', 'error');
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
        <ScrollView
          contentContainerStyle={[
            s.content,
            { paddingBottom: Math.max(insets.bottom, 24) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Logo Header */}
          <View style={s.logoCard}>
            <Image source={brandLogo} style={s.logoImg} contentFit="contain" />
            <Text style={s.eyebrow}>DHANVIKK</Text>
            <Text style={s.brandSub}>Blooms and Exports</Text>
            <Text style={s.title}>Welcome back.</Text>
            <Text style={s.sub}>
              Sign in to manage your blooms, track orders, and save your delivery addresses.
            </Text>
          </View>

          {/* 1-Tap Google Sign-In Button */}
          <Pressable
            style={s.googleBtn}
            onPress={() => setGoogleModal(true)}
            hitSlop={4}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={s.googleBtnText}>Continue with Google</Text>
          </Pressable>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or sign in with email</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Form */}
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

      <GoogleSignInModal
        visible={googleModal}
        onClose={() => setGoogleModal(false)}
        onSuccess={() => router.replace('/(tabs)/home')}
      />
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
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    flexGrow: 1,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  logoCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.primaryDeep,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 4,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 320,
  },
  googleBtn: {
    height: 50,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lineLight,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    height: 50,
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
    height: 50,
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
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    fontSize: 13,
    color: colors.muted,
  },
  linkBold: {
    color: colors.primaryDeep,
    fontWeight: '800',
  },
});