import { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { colors, radius, spacing } from '@/constants/theme';
import { loginWithGoogle } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

let WebBrowserModule: typeof import('expo-web-browser') | null = null;
let GoogleAuthModule: typeof import('expo-auth-session/providers/google') | null = null;
let isNativeOAuthSupported = false;

try {
  WebBrowserModule = require('expo-web-browser');
  GoogleAuthModule = require('expo-auth-session/providers/google');
  if (WebBrowserModule && typeof WebBrowserModule.maybeCompleteAuthSession === 'function') {
    WebBrowserModule.maybeCompleteAuthSession();
  }
  if (GoogleAuthModule && typeof (GoogleAuthModule.useIdTokenAuthRequest || GoogleAuthModule.useAuthRequest) === 'function') {
    isNativeOAuthSupported = true;
  }
} catch {
  isNativeOAuthSupported = false;
}

const brandLogo = require('@/assets/logo.png');

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (user?: any) => void;
}

function NativeGoogleOAuthButton({
  busy,
  onAuthSuccess,
  onAuthError,
}: {
  busy: boolean;
  onAuthSuccess: (tokens: { idToken?: string; accessToken?: string }) => void;
  onAuthError: (errMsg: string) => void;
}) {
  const useGoogleAuthHook =
    (GoogleAuthModule as any)?.useIdTokenAuthRequest || GoogleAuthModule?.useAuthRequest;

  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '160660053649-mjj7qud9fnlqmnf2jvqjqqhlqsoqo1bn.apps.googleusercontent.com';
  const reverseClientId = 'com.googleusercontent.apps.160660053649-mjj7qud9fnlqmnf2jvqjqqhlqsoqo1bn';
  const redirectUri = Platform.OS === 'android'
    ? `${reverseClientId}:/oauthredirect`
    : undefined;

  const [request, response, promptAsync] = useGoogleAuthHook!({
    clientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com',
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com',
    androidClientId,
    redirectUri,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = (response.params as any) || {};
      const idToken = id_token || (response as any).authentication?.idToken;
      const accessToken = access_token || (response as any).authentication?.accessToken;
      if (idToken || accessToken) {
        onAuthSuccess({ idToken, accessToken });
      } else {
        onAuthError('Google sign-in did not return valid credentials.');
      }
    } else if (response?.type === 'error') {
      onAuthError(
        response.error?.message ||
        'Google OAuth project is awaiting release certificate linking. Please sign in or create an account with email & password.'
      );
    }
  }, [response, onAuthSuccess, onAuthError]);

  return (
    <Pressable
      style={[s.officialGoogleBtn, (!request || busy) && { opacity: 0.7 }]}
      onPress={async () => {
        try {
          await promptAsync();
        } catch (err: any) {
          onAuthError(err?.message || 'Unable to open Google Sign-In.');
        }
      }}
      disabled={busy || !request}
    >
      <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
      <Text style={s.officialGoogleBtnText}>Sign in with Google Account</Text>
    </Pressable>
  );
}

export function GoogleSignInModal({ visible, onClose, onSuccess }: GoogleSignInModalProps) {
  const setUser = useStore((s) => s.setUser);
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

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
        showToast('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${backendRes.user.name || cleanEmail}`, 'success', 3000);
      }
    } catch (err: any) {
      console.error('Web Google Sign-In error:', err);
      showToast(
        'Google Sign-In Error',
        err?.message || 'Unable to complete Google sign-in. Please use email & password.',
        'error',
        3500
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFirebaseGoogleAuth = async ({ idToken, accessToken }: { idToken?: string; accessToken?: string }) => {
    setBusy(true);
    try {
      let fbUser: any = null;
      if (idToken || accessToken) {
        const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
        const userCred = await signInWithCredential(auth, credential);
        fbUser = userCred.user;
      }

      let cleanEmail = (fbUser?.email || '').trim().toLowerCase();
      let cleanName = fbUser?.displayName || (cleanEmail ? cleanEmail.split('@')[0] : '');
      let avatar = fbUser?.photoURL || '';

      if (!cleanEmail && accessToken) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userinfo = await userinfoRes.json();
          cleanEmail = (userinfo.email || '').trim().toLowerCase();
          cleanName = userinfo.name || (cleanEmail ? cleanEmail.split('@')[0] : '');
          avatar = userinfo.picture || '';
        } catch (fetchErr) {
          console.warn('Could not fetch extra Google profile details:', fetchErr);
        }
      }

      if (!cleanEmail) {
        throw new Error('Could not retrieve an email address from your Google Account.');
      }

      if (!avatar) {
        avatar = `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;
      }

      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid: fbUser?.uid || `goog_${cleanEmail}`,
      });

      if (res?.user) {
        setUser(res.user);
        onClose();
        if (onSuccess) onSuccess(res.user);
        showToast('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${res.user.name || cleanEmail}`, 'success', 3000);
      }
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      showToast(
        'Google Authentication Note',
        err?.message || 'Unable to verify Google credentials. Please sign in or register with email & password.',
        'error',
        3500
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAuthError = (msg: string) => {
    Alert.alert(
      'Google Sign-In Configuration',
      'Google Cloud Project (160660053649) requires the production release SHA-1 certificate to be registered before direct Google login is enabled on this APK.\n\nPlease sign in or create your account using your email and password below.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Email & Password',
          onPress: () => {
            onClose();
            router.push('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <Image source={brandLogo} style={s.brandIcon} contentFit="contain" />
            <Text style={s.sheetTitle}>Sign in to Dhanvikk</Text>
            <Pressable style={s.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <Text style={s.sheetSub}>
            Sign in with your verified account to access <Text style={s.brandHighlight}>Dhanvikk Blooms</Text>
          </Text>

          {busy ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>Authenticating…</Text>
            </View>
          ) : (
            <View style={s.accountsList}>
              {/* Google Sign In Button */}
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
                  onAuthError={handleAuthError}
                />
              ) : (
                <Pressable
                  style={s.officialGoogleBtn}
                  onPress={() => handleAuthError('Native Google OAuth not available')}
                  disabled={busy}
                >
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                  <Text style={s.officialGoogleBtnText}>Sign in with Google Account</Text>
                </Pressable>
              )}

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or authenticate with email</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Secure Email & Password Login Button */}
              <Pressable
                style={s.emailBtn}
                onPress={() => {
                  onClose();
                  router.push('/auth/login');
                }}
              >
                <Ionicons name="mail-outline" size={20} color={colors.white} style={{ marginRight: 10 }} />
                <Text style={s.emailBtnText}>Sign in with Email & Password</Text>
              </Pressable>

              {/* Create New Account Button */}
              <Pressable
                style={s.registerBtn}
                onPress={() => {
                  onClose();
                  router.push('/auth/register');
                }}
              >
                <Ionicons name="person-add-outline" size={18} color={colors.primaryDeep} style={{ marginRight: 8 }} />
                <Text style={s.registerBtnText}>Create New Customer Account</Text>
              </Pressable>
            </View>
          )}

          <Text style={s.termsText}>
            Every customer account is protected with enterprise authentication and encrypted personal address storage.
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
    gap: 10,
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
    height: 50,
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
    marginVertical: 6,
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
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 50,
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emailBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pale,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    height: 48,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  termsText: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default GoogleSignInModal;
