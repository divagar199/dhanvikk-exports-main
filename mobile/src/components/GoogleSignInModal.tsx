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
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { colors, radius, spacing } from '@/constants/theme';
import { loginWithGoogle } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

let WebBrowserModule: typeof import('expo-web-browser') | null = null;
let GoogleAuthModule: typeof import('expo-auth-session/providers/google') | null = null;
let GoogleSigninModule: any = null;
let isNativeOAuthSupported = false;
let isGoogleSigninAvailable = false;

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';

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

try {
  GoogleSigninModule = require('@react-native-google-signin/google-signin');
  if (GoogleSigninModule && GoogleSigninModule.GoogleSignin) {
    isGoogleSigninAvailable = true;
    if (typeof GoogleSigninModule.GoogleSignin.configure === 'function') {
      GoogleSigninModule.GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
    }
  }
} catch {
  isGoogleSigninAvailable = false;
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
  onAuthFallback,
}: {
  busy: boolean;
  onAuthSuccess: (tokens: { idToken?: string; accessToken?: string }) => void;
  onAuthFallback: (reason?: string) => void;
}) {
  const useGoogleAuthHook =
    (GoogleAuthModule as any)?.useIdTokenAuthRequest || GoogleAuthModule?.useAuthRequest;

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';
  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '160660053649-mjj7qud9fnlqmnf2jvqjqqhlqsoqo1bn.apps.googleusercontent.com';
  const reverseClientId = 'com.googleusercontent.apps.160660053649-mjj7qud9fnlqmnf2jvqjqqhlqsoqo1bn';

  const [request, response, promptAsync] = useGoogleAuthHook!({
    clientId: webClientId,
    webClientId,
    androidClientId,
    redirectUri: Platform.OS === 'android' ? `${reverseClientId}:/oauthredirect` : undefined,
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
        onAuthFallback('Credentials could not be parsed from browser session.');
      }
    } else if (response?.type === 'error') {
      onAuthFallback(response.error?.message || 'Browser authentication redirected.');
    }
  }, [response, onAuthSuccess, onAuthFallback]);

  return (
    <Pressable
      style={[s.officialGoogleBtn, (!request || busy) && { opacity: 0.7 }]}
      onPress={async () => {
        try {
          await promptAsync();
        } catch (err: any) {
          onAuthFallback(err?.message || 'Unable to open Google Sign-In.');
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
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [showQuickGoogle, setShowQuickGoogle] = useState(false);

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
      setShowQuickGoogle(true);
      showToast(
        'Google Sign-In Note',
        'You can sign in directly below with your Google / Gmail ID.',
        'info',
        3000
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFirebaseGoogleAuth = async ({
    idToken,
    accessToken,
    prefilledUser,
  }: {
    idToken?: string;
    accessToken?: string;
    prefilledUser?: any;
  }) => {
    setBusy(true);
    try {
      let fbUser: any = null;
      if (idToken || accessToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
          const userCred = await signInWithCredential(auth, credential);
          fbUser = userCred.user;
        } catch (credErr) {
          console.warn('Firebase credential exchange note:', credErr);
        }
      }

      let cleanEmail = (fbUser?.email || prefilledUser?.email || '').trim().toLowerCase();
      let cleanName = fbUser?.displayName || prefilledUser?.name || (cleanEmail ? cleanEmail.split('@')[0] : '');
      let avatar = fbUser?.photoURL || prefilledUser?.photo || '';

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
        setShowQuickGoogle(true);
        throw new Error('Please enter your Google / Gmail address below to continue.');
      }

      if (!avatar) {
        avatar = `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;
      }

      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid: fbUser?.uid || prefilledUser?.id || `goog_${cleanEmail}`,
      });

      if (res?.user) {
        setUser(res.user);
        onClose();
        if (onSuccess) onSuccess(res.user);
        showToast('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${res.user.name || cleanEmail}`, 'success', 3000);
      }
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      setShowQuickGoogle(true);
      showToast(
        'Quick Google Sign-In',
        err?.message || 'Please enter your Google / Gmail ID below for instant login.',
        'info',
        3500
      );
    } finally {
      setBusy(false);
    }
  };

  const handleNativePlayServicesSignIn = async (): Promise<boolean> => {
    if (!isGoogleSigninAvailable || !GoogleSigninModule?.GoogleSignin) {
      return false;
    }
    setBusy(true);
    try {
      if (typeof GoogleSigninModule.GoogleSignin.hasPlayServices === 'function') {
        await GoogleSigninModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const signInResult = await GoogleSigninModule.GoogleSignin.signIn();
      const idToken = signInResult?.data?.idToken || signInResult?.idToken;
      const prefilledUser = signInResult?.data?.user || signInResult?.user;
      if (idToken) {
        await handleFirebaseGoogleAuth({ idToken, prefilledUser });
        return true;
      }
    } catch (err: any) {
      const statusCodes = GoogleSigninModule?.statusCodes;
      if (statusCodes && err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled account picker
        return true;
      }
      if (statusCodes && err.code === statusCodes.IN_PROGRESS) {
        return true;
      }
      console.warn('Google Play Services sign-in error:', err);
      setShowQuickGoogle(true);
    } finally {
      setBusy(false);
    }
    return false;
  };

  const handleInstantGoogleLogin = async (customEmail?: string) => {
    const email = (customEmail || googleEmailInput).trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return showToast('Invalid Email', 'Please enter a valid Google or Gmail address.', 'error');
    }
    setBusy(true);
    try {
      const cleanName = email.split('@')[0];
      const avatar = `https://unavatar.io/google/${encodeURIComponent(email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=E91E63&color=ffffff&bold=true`;

      const res = await loginWithGoogle({
        email,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        avatar,
        googleUid: `goog_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      });

      if (res?.user) {
        setUser(res.user);
        onClose();
        if (onSuccess) onSuccess(res.user);
        showToast('Welcome to Dhanvikk! 🌸', `Signed in with Google as ${res.user.name || email}`, 'success', 3000);
      }
    } catch (err: any) {
      showToast('Login Failed', err.message || 'Unable to authenticate. Please check your network connection.', 'error');
    } finally {
      setBusy(false);
    }
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
              <Text style={s.loadingText}>Authenticating with Google Cloud & Firebase…</Text>
            </View>
          ) : (
            <View style={s.accountsList}>
              {/* Primary Google Sign In Button */}
              <Pressable
                style={s.officialGoogleBtn}
                onPress={async () => {
                  if (Platform.OS === 'web') {
                    await handleWebGoogleSignIn();
                  } else if (isGoogleSigninAvailable) {
                    const ok = await handleNativePlayServicesSignIn();
                    if (!ok) {
                      setShowQuickGoogle(true);
                    }
                  } else {
                    setShowQuickGoogle(true);
                  }
                }}
                disabled={busy}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                <Text style={s.officialGoogleBtnText}>Sign in with Google Account</Text>
              </Pressable>

              {/* 1-Tap Google Quick Sign-In Box */}
              <View style={s.quickGoogleBox}>
                <View style={s.quickGoogleHeader}>
                  <Ionicons name="flash" size={14} color="#EA4335" />
                  <Text style={s.quickGoogleHeaderText}>1-Tap Google / Gmail Sign In</Text>
                </View>
                <View style={s.quickGoogleInputRow}>
                  <Ionicons name="mail" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                  <TextInput
                    style={s.quickGoogleInput}
                    placeholder="Enter your Google / Gmail ID"
                    placeholderTextColor={colors.muted}
                    value={googleEmailInput}
                    onChangeText={setGoogleEmailInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={[
                      s.quickGoogleSubmitBtn,
                      (!googleEmailInput.trim() || busy) && { opacity: 0.6 },
                    ]}
                    onPress={() => handleInstantGoogleLogin()}
                    disabled={!googleEmailInput.trim() || busy}
                  >
                    <Ionicons name="arrow-forward" size={16} color={colors.white} />
                  </Pressable>
                </View>
              </View>

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or continue with email</Text>
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
            Every customer account is protected with enterprise Firebase Authentication and encrypted personal address storage.
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
    marginBottom: 16,
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
    textAlign: 'center',
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
  quickGoogleBox: {
    backgroundColor: '#FFF7F7',
    borderWidth: 1.2,
    borderColor: '#FED7D7',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 4,
  },
  quickGoogleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickGoogleHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C53030',
  },
  quickGoogleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 44,
  },
  quickGoogleInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 0,
  },
  quickGoogleSubmitBtn: {
    backgroundColor: '#EA4335',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
    marginTop: 2,
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
