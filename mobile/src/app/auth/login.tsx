import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Flower2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadows, Typography } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { GrandLogo } from '../../components/GrandLogo';
import GoogleAuthModal from '../../components/GoogleAuthModal';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function LoginScreen() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const { showToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // If already authenticated, redirect straight to Account
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/account');
    }
  }, [user]);

  // 1. Google Automatic Redirect Sign-In Handler
  const handleGoogleSignIn = async () => {
    Keyboard.dismiss();
    setErrorMsg('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    try {
      setLoading(true);
      setAuthStatus('Redirecting to Google account page...');

      const res = await authService.redirectToGoogleLoginPage();
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        setLoading(false);
        setAuthStatus('');
        showToast(`Welcome back, ${res.user.name}! 🌸`, 'success');
        router.replace('/(tabs)/account');
        return;
      }

      setLoading(false);
      setAuthStatus('');

      if (res.cancelled) {
        return;
      }

      // Seamless fallback to 1-Tap Google sheet if browser redirect had issues
      setShowGoogleModal(true);
    } catch {
      setLoading(false);
      setAuthStatus('');
      setShowGoogleModal(true);
    }
  };

  // 2. Email & Password Sign-In Handler
  const handleEmailSignIn = async () => {
    Keyboard.dismiss();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setAuthStatus('Verifying credentials...');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      const res = await authService.login(cleanEmail, cleanPass);
      setAuth(res.user, res.token);
      setLoading(false);
      setAuthStatus('');

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      showToast(`Welcome back, ${res.user.name}!`, 'success');
      router.replace('/(tabs)/account');
    } catch (err: any) {
      setLoading(false);
      setAuthStatus('');
      const friendly =
        err?.response?.data?.message ||
        err?.friendlyMessage ||
        err?.message ||
        'Invalid email or password.';
      setErrorMsg(friendly);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.navBrandPill}>
            <Flower2 size={13} color={Colors.gold} />
            <AppText
              variant="caption"
              weight="bold"
              color={Colors.primaryDeep}
              style={styles.navBrandText}
            >
              DHANVIKK ATELIER
            </AppText>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Brand Header */}
          <View style={styles.brandSection}>
            <GrandLogo
              size="lg"
              showSubtitle={true}
              subtitleText="HAUTE FLORISTRY"
            />
            <AppText variant="h1" align="center" style={styles.title}>
              Welcome Back
            </AppText>
            <AppText
              variant="bodySm"
              color={Colors.textSecondary}
              align="center"
              style={styles.subtitle}
            >
              Sign in to manage your orders, private curation & bespoke floral deliveries.
            </AppText>
          </View>

          {/* Luxury Authentication Form Card */}
          <View style={styles.formCard}>
            {/* Error Notification Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={Colors.error} />
                <AppText
                  variant="caption"
                  color={Colors.error}
                  weight="medium"
                  style={styles.errorText}
                >
                  {errorMsg}
                </AppText>
              </View>
            ) : null}

            {/* Live Loading / Sync Banner */}
            {loading && authStatus ? (
              <View style={styles.loadingBanner}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <AppText
                  variant="caption"
                  color={Colors.primaryDeep}
                  weight="medium"
                  style={{ marginLeft: 8 }}
                >
                  {authStatus}
                </AppText>
              </View>
            ) : null}

            {/* Prominent Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleBtn, loading && { opacity: 0.6 }]}
              activeOpacity={0.88}
              onPress={handleGoogleSignIn}
              disabled={loading}
              accessibilityLabel="Continue with Google"
            >
              <Image
                source={{
                  uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                }}
                style={styles.googleIcon}
                contentFit="contain"
              />
              <AppText variant="body" weight="semiBold" color={Colors.text}>
                Continue with Google
              </AppText>
            </TouchableOpacity>

            <View style={styles.googleHintRow}>
              <Sparkles size={12} color={Colors.primary} />
              <AppText variant="caption" color={Colors.textSecondary} style={{ fontSize: 11, marginLeft: 5 }}>
                1-Tap authentication with Google or Gmail
              </AppText>
            </View>

            {/* Editorial Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText variant="caption" color={Colors.textSecondary} style={styles.dividerText}>
                or sign in with email
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Input */}
            <AppInput
              label="EMAIL ADDRESS"
              placeholder="you@domain.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg) setErrorMsg('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Mail size={18} color={Colors.textSecondary} />}
              editable={!loading}
              containerStyle={{ marginBottom: Spacing.md }}
            />

            {/* Password Input with Toggle */}
            <AppInput
              label="PASSWORD"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMsg) setErrorMsg('');
              }}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color={Colors.textSecondary} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
              editable={!loading}
              containerStyle={{ marginBottom: Spacing.xs }}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              style={styles.forgotBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="caption" color={Colors.primaryDeep} weight="medium">
                Forgot password?
              </AppText>
            </TouchableOpacity>

            {/* Primary Sign In Button */}
            <AppButton
              title="Sign In"
              onPress={handleEmailSignIn}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
              style={styles.submitBtn}
            />

            {/* Security Footnote */}
            <View style={styles.securityBadge}>
              <ShieldCheck size={13} color={Colors.success} />
              <AppText
                variant="caption"
                color={Colors.textSecondary}
                style={{ fontSize: 11, marginLeft: 6 }}
              >
                Secured by Firebase & Google Identity
              </AppText>
            </View>
          </View>

          {/* Footer: Register Navigation */}
          <View style={styles.footerRow}>
            <AppText variant="bodySm" color={Colors.textSecondary}>
              {"Don't have an account yet?"}
            </AppText>
            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="bodySm" color={Colors.primaryDeep} weight="bold">
                Register
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Guest Access Link */}
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={styles.guestLink}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" color={Colors.textSecondary} weight="medium">
              Browse Blooms as Guest →
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google 1-Tap Account Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        initialEmail={email}
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  navBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  navBrandText: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
    fontSize: 26,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: Radius.input,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePink,
    borderRadius: Radius.input,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: Radius.button,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
    ...Shadows.sm,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: Spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  guestLink: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    paddingVertical: 4,
  },
});
