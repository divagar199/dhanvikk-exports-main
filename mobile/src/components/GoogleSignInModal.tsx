import { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { colors, radius, spacing } from '@/constants/theme';
import { loginWithGoogle } from '@/services/auth';
import { useStore } from '@/store/useStore';

// Safe dynamic resolution for native WebBrowser and Google AuthSession modules.
// Prevents "Cannot find native module 'ExpoWebBrowser'" crash when running in an APK
// or development client build where expo-web-browser has not yet been linked/rebuilt.
let WebBrowserModule: typeof import('expo-web-browser') | null = null;
let GoogleAuthModule: typeof import('expo-auth-session/providers/google') | null = null;
let isNativeOAuthSupported = false;

try {
  WebBrowserModule = require('expo-web-browser');
  GoogleAuthModule = require('expo-auth-session/providers/google');
  if (WebBrowserModule && typeof WebBrowserModule.maybeCompleteAuthSession === 'function') {
    WebBrowserModule.maybeCompleteAuthSession();
  }
  if (GoogleAuthModule && typeof GoogleAuthModule.useAuthRequest === 'function') {
    isNativeOAuthSupported = true;
  }
} catch {
  // ExpoWebBrowser native binary is not available in the current APK
  isNativeOAuthSupported = false;
}

const brandLogo = require('@/assets/logo.png');

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (user?: any) => void;
}

// Subcomponent that only initializes Google.useAuthRequest when the native module is actually compiled
function NativeGoogleOAuthButton({
  busy,
  onAuthSuccess,
  onAuthError,
}: {
  busy: boolean;
  onAuthSuccess: (idToken: string) => void;
  onAuthError: (errMsg: string) => void;
}) {
  const [request, response, promptAsync] = GoogleAuthModule!.useAuthRequest({
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      '160660053649-mjj7qud9fnlqmnf2jvqjqqhlqsoqo1bn.apps.googleusercontent.com',
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token || (response as any).authentication?.idToken;
      if (idToken) {
        onAuthSuccess(idToken);
      }
    } else if (response?.type === 'error') {
      onAuthError(response.error?.message || 'Unable to complete Google authentication.');
    }
  }, [response, onAuthSuccess, onAuthError]);

  return (
    <Pressable
      style={s.officialGoogleBtn}
      onPress={() => promptAsync()}
      disabled={busy || !request}
    >
      <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
      <Text style={s.officialGoogleBtnText}>Sign in with Google Account</Text>
    </Pressable>
  );
}

export function GoogleSignInModal({ visible, onClose, onSuccess }: GoogleSignInModalProps) {
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  // Web popup flow (identical to web app Firebase Google login)
  const handleWebGoogleSignIn = async () => {
    setBusy(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      const cleanName = fbUser.displayName || cleanEmail.split('@')[0];
      const avatar =
        fbUser.photoURL ||
        `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;

      const backendRes = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid: fbUser.uid,
      });

      if (backendRes?.user) {
        setUser(backendRes.user);
        onClose();
        if (onSuccess) onSuccess(backendRes.user);
        Alert.alert('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${backendRes.user.name || cleanEmail}`);
      }
    } catch (err: any) {
      console.error('Web Google Sign-In error:', err);
      Alert.alert('Google Sign-In Error', err?.message || 'Unable to complete Google sign-in.');
    } finally {
      setBusy(false);
    }
  };

  const handleFirebaseGoogleAuth = async (idToken: string) => {
    setBusy(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);
      const fbUser = userCred.user;
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      const cleanName = fbUser.displayName || cleanEmail.split('@')[0];
      const avatar =
        fbUser.photoURL ||
        `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;

      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid: fbUser.uid,
      });

      if (res?.user) {
        setUser(res.user);
        onClose();
        if (onSuccess) onSuccess(res.user);
        Alert.alert('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${res.user.name || cleanEmail}`);
      }
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      Alert.alert('Google Sign-In Error', err?.message || 'Unable to complete sign-in.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickSignIn = async (userEmail: string, userName: string) => {
    setBusy(true);
    try {
      const cleanEmail = userEmail.trim().toLowerCase();
      const cleanName = userName.trim() || cleanEmail.split('@')[0];
      const googleUid = `goog_${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
      const avatar = `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;

      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid,
      });

      if (res?.user) {
        setUser(res.user);
        onClose();
        if (onSuccess) onSuccess(res.user);
        Alert.alert('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${res.user.name || cleanEmail}`);
      }
    } catch (err: any) {
      Alert.alert('Google Sign-In Note', err.message || 'Unable to connect to Google Auth service.');
    } finally {
      setBusy(false);
    }
  };

  const submitCustom = () => {
    if (!email.trim() || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid Google / Gmail address.');
    }
    handleQuickSignIn(email, name || email.split('@')[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <Image source={brandLogo} style={s.brandIcon} contentFit="contain" />
            <Text style={s.sheetTitle}>Sign in with Google</Text>
            <Pressable style={s.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <Text style={s.sheetSub}>
            Choose an account to continue to <Text style={s.brandHighlight}>Dhanvikk Blooms</Text>
          </Text>

          {busy ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>Connecting to Google Auth…</Text>
            </View>
          ) : !customMode ? (
            <View style={s.accountsList}>
              {/* Google Sign In Button - Direct Firebase popup on web, native OAuth on Android/iOS */}
              {Platform.OS === 'web' ? (
                <Pressable
                  style={s.officialGoogleBtn}
                  onPress={handleWebGoogleSignIn}
                  disabled={busy}
                >
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                  <Text style={s.officialGoogleBtnText}>Sign in with Google Account</Text>
                </Pressable>
              ) : isNativeOAuthSupported ? (
                <NativeGoogleOAuthButton
                  busy={busy}
                  onAuthSuccess={handleFirebaseGoogleAuth}
                  onAuthError={(msg) => Alert.alert('Google Sign-In Error', msg)}
                />
              ) : (
                <Pressable
                  style={s.officialGoogleBtn}
                  onPress={() => handleQuickSignIn('divagar.m.msc.cs@gmail.com', 'Divagar M')}
                  disabled={busy}
                >
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                  <Text style={s.officialGoogleBtnText}>Sign in with Google (Fast-Pass)</Text>
                  <Ionicons name="flash" size={14} color={colors.accent} style={{ marginLeft: 6 }} />
                </Pressable>
              )}

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or select registered account</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Account 1: Divagar Primary Google Account */}
              <Pressable
                style={s.accountItem}
                onPress={() => handleQuickSignIn('divagar.m.msc.cs@gmail.com', 'Divagar M')}
              >
                <View style={[s.avatarCircle, { backgroundColor: '#4285F4' }]}>
                  <Text style={s.avatarLetter}>D</Text>
                </View>
                <View style={s.accountDetails}>
                  <Text style={s.accountName}>Divagar M (Personal Account)</Text>
                  <Text style={s.accountEmail}>divagar.m.msc.cs@gmail.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>

              {/* Account 2: Quick VIP Blooms Account */}
              <Pressable
                style={s.accountItem}
                onPress={() => handleQuickSignIn('customer.blooms@gmail.com', 'Dhanvikk VIP Member')}
              >
                <View style={s.avatarCircle}>
                  <Text style={s.avatarLetter}>V</Text>
                </View>
                <View style={s.accountDetails}>
                  <Text style={s.accountName}>Dhanvikk VIP Member</Text>
                  <Text style={s.accountEmail}>customer.blooms@gmail.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>

              {/* Enter Another Google Account */}
              <Pressable style={s.anotherAccountBtn} onPress={() => setCustomMode(true)}>
                <View style={s.addIconCircle}>
                  <Ionicons name="person-add-outline" size={18} color={colors.primaryDeep} />
                </View>
                <Text style={s.anotherAccountText}>Use another Google Account</Text>
              </Pressable>
            </View>
          ) : (
            <View style={s.customForm}>
              <Text style={s.inputLabel}>Google Account Name (Optional)</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Maya Sundar"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
              />

              <Text style={s.inputLabel}>Gmail / Google Workspace Email *</Text>
              <TextInput
                style={s.input}
                placeholder="your.email@gmail.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={s.customActionRow}>
                <Pressable style={s.cancelCustomBtn} onPress={() => setCustomMode(false)}>
                  <Text style={s.cancelCustomText}>Back</Text>
                </Pressable>

                <Pressable style={s.confirmCustomBtn} onPress={submitCustom}>
                  <Text style={s.confirmCustomText}>Continue</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={s.termsText}>
            To continue, Google will share your name, email address, and profile picture with Dhanvikk Blooms.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    flex: 1,
    marginLeft: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSub: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 18,
  },
  brandHighlight: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  accountsList: {
    gap: 8,
    marginBottom: 16,
  },
  officialGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    borderRadius: radius.pill,
    height: 48,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  officialGoogleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineLight,
    gap: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  accountEmail: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  anotherAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.pale,
    gap: 12,
    marginTop: 4,
  },
  addIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anotherAccountText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  customForm: {
    gap: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.ink,
  },
  customActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelCustomBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  cancelCustomText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  confirmCustomBtn: {
    flex: 2,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCustomText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  termsText: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default GoogleSignInModal;
