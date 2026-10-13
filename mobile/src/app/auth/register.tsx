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
import { register } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/constants/theme';

export default function Register() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Missing Details', 'Name, email, and password are required.');
    }
    if (password.length < 6) {
      return Alert.alert('Password Length', 'Password must be at least 6 characters long.');
    }

    setBusy(true);
    try {
      const r = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      setUser(r.user);
      Alert.alert('Account Created', 'Welcome to Dhanvikk Blooms!');
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Please check your information and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.topBar}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.eyebrow}>JOIN DHANVIKK</Text>
          <Text style={s.title}>Make every moment bloom.</Text>
          <Text style={s.sub}>
            Create your account for faster checkout, order tracking, and exclusive floral drops.
          </Text>

          <Text style={s.label}>Full Name *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Priya Sharma"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />

          <Text style={s.label}>Email Address *</Text>
          <TextInput
            style={s.input}
            placeholder="name@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={s.label}>Phone Number</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor={colors.muted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={s.label}>Password (minimum 6 characters) *</Text>
          <View style={s.passwordBox}>
            <TextInput
              style={s.passwordInput}
              placeholder="Create a strong password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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
            <Text style={s.buttonText}>{busy ? 'Creating Account…' : 'Create Account'}</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={s.linkWrap}>
            <Text style={s.link}>Already have an account? <Text style={s.linkBold}>Sign in</Text></Text>
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
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
    marginBottom: 12,
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
    marginTop: 20,
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