import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Flower2, Mail, Lock, User, Phone, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { GrandLogo } from '../../components/GrandLogo';
import GoogleAuthModal from '../../components/GoogleAuthModal';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const city = 'Dubai';
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const res = await authService.redirectToGoogleLoginPage(email.trim() || undefined);
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        setLoading(false);
        showToast(`Welcome to Dhanvikk Blooms, ${res.user.name}! 🌸`, 'success');
        router.replace('/(tabs)/account');
        return;
      }
      setLoading(false);
      if (res.cancelled) return;
      setShowGoogleModal(true);
    } catch {
      setLoading(false);
      setShowGoogleModal(true);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide your full name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        country: 'United Arab Emirates',
      });

      setAuth(res.user, res.token);
      setLoading(false);
      showToast('Welcome to Dhanvikk Blooms! 🌸', 'success');
      router.replace('/(tabs)/account');
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Registration Notice', err.friendlyMessage || 'Unable to register account.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.brandIconWrap}>
            <GrandLogo
              size="lg"
              showSubtitle={true}
              subtitleText="HAUTE FLORISTRY"
            />
            <AppText variant="h1" align="center" style={{ marginTop: 14 }}>
              Create Your Account
            </AppText>
            <AppText
              variant="bodySm"
              color={Colors.textSecondary}
              align="center"
              style={{ marginTop: 6, maxWidth: 300 }}
            >
              Join the Dhanvikk inner circle for curated floral experiences and white-glove gifting.
            </AppText>
          </View>

          <View style={styles.formCard}>
            <AppInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Priya Sharma"
              icon={<User size={18} color={Colors.textSecondary} />}
            />

            <AppInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@domain.com"
              icon={<Mail size={18} color={Colors.textSecondary} />}
            />

            <AppInput
              label="Contact Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+971 50 123 4567"
              icon={<Phone size={18} color={Colors.textSecondary} />}
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Minimum 6 characters"
              icon={<Lock size={18} color={Colors.textSecondary} />}
            />

            <AppInput
              label="Delivery Address (Optional)"
              value={street}
              onChangeText={setStreet}
              placeholder="Villa / Flat, Street name"
              icon={<MapPin size={18} color={Colors.textSecondary} />}
            />

            <AppButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginTop: 12 }}
            />

            {/* Divider */}
            <View style={styles.orDividerRow}>
              <View style={styles.orLine} />
              <AppText variant="caption" color={Colors.textSecondary} style={styles.orText}>
                OR
              </AppText>
              <View style={styles.orLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.85}
              onPress={handleGoogleRegister}
              disabled={loading}
            >
              <Image
                source={{
                  uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                }}
                style={styles.googleLogo}
                contentFit="contain"
              />
              <AppText variant="bodySm" weight="semiBold" color={Colors.text}>
                Sign up with Google
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <AppText variant="bodySm" color={Colors.textSecondary}>
              Already have an account?
            </AppText>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <AppText variant="bodySm" color={Colors.primaryDeep} weight="semiBold">
                Sign In
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        initialEmail={email}
        initialName={name}
        onSuccess={() => router.replace('/(tabs)/account')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 40,
  },
  brandIconWrap: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    marginHorizontal: Spacing.md,
    fontSize: 11,
    letterSpacing: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 12,
    gap: 10,
    ...Shadows.sm,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
});
