import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, saveUserToDb } from '@/lib/firebase';
import { colors, radius, spacing } from '@/constants/theme';
import { loginWithGoogle } from '@/services/auth';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

// ─── Lazy-load @react-native-google-signin/google-signin ─────────────────────
// The package only exists in a native Expo dev-client / standalone build.
// We guard with try/catch so Expo Go & web continue to work without it.

let GoogleSignin: any = null;
let statusCodes: any = null;
let isNativeSigninAvailable = false;

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';

try {
  const pkg = require('@react-native-google-signin/google-signin');
  if (pkg?.GoogleSignin) {
    GoogleSignin = pkg.GoogleSignin;
    statusCodes = pkg.statusCodes;
    isNativeSigninAvailable = true;

    // Configure once at module load
    if (typeof GoogleSignin.configure === 'function') {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
    }
  }
} catch {
  isNativeSigninAvailable = false;
}

const brandLogo = require('@/assets/logo.png');

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoogleSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (user?: any) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Saves the Firebase-authenticated user to the backend and the local store.
 */
async function persistUserLogin(
  fbUid: string,
  email: string,
  name: string,
  avatar: string,
  phone: string,
  setUser: (u: any) => void,
  showToast: (...args: any[]) => void,
  onClose: () => void,
  onSuccess?: (u?: any) => void
) {
  const res = await loginWithGoogle({
    email: email.trim().toLowerCase(),
    name,
    avatar,
    googleUid: fbUid,
    phone,
  });

  if (res?.user) {
    setUser(res.user);
    onClose();
    if (onSuccess) onSuccess(res.user);
    showToast(
      'Welcome to Dhanvikk! 🌸',
      `Signed in as ${res.user.name || email}`,
      'success',
      3000
    );
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GoogleSignInModal({ visible, onClose, onSuccess }: GoogleSignInModalProps) {
  const setUser = useStore((s) => s.setUser);
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Web: signInWithPopup ──────────────────────────────────────────────────
  const handleWebGoogleSignIn = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      const cleanName = fbUser.displayName || cleanEmail.split('@')[0];
      const avatar = fbUser.photoURL || '';

      // Sync to Firestore users/{uid}
      saveUserToDb(fbUser, { name: cleanName, provider: 'google.com' }).catch(() => {});

      await persistUserLogin(
        fbUser.uid,
        cleanEmail,
        cleanName,
        avatar,
        fbUser.phoneNumber || '',
        setUser,
        showToast,
        onClose,
        onSuccess
      );
    } catch (err: any) {
      const code: string = err?.code || '';

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User dismissed — no error toast needed
        return;
      }
      if (code === 'auth/popup-blocked') {
        setErrorMsg('Popup blocked by your browser. Please allow popups for this site and try again.');
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not authorised in Firebase Console. Contact support.');
        return;
      }
      if (code === 'auth/network-request-failed') {
        setErrorMsg('Network error. Please check your connection and try again.');
        return;
      }
      console.warn('[GoogleSignInModal] Web sign-in error:', err);
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Native Android: @react-native-google-signin/google-signin ────────────
  //
  // KEY FIX: We call `GoogleSignin.signOut()` BEFORE `GoogleSignin.signIn()`.
  // This forces the Google account chooser to show every time.
  // Without this, Google silently reuses the last account.
  const handleNativeGoogleSignIn = async () => {
    if (!isNativeSigninAvailable || !GoogleSignin) return false;

    setBusy(true);
    setErrorMsg(null);

    try {
      // Check Play Services availability
      if (typeof GoogleSignin.hasPlayServices === 'function') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // ⚠️ ALWAYS sign out first to force the account chooser to appear.
      // This is the critical step that implements "prompt: select_account" on Android.
      try {
        if (typeof GoogleSignin.signOut === 'function') {
          await GoogleSignin.signOut();
        }
      } catch {
        // Sign-out failure is non-fatal; proceed to sign-in
      }

      // Now trigger the account chooser
      const signInResult = await GoogleSignin.signIn();

      // API v16+: result wrapped in `data`
      const idToken: string | undefined =
        signInResult?.data?.idToken || signInResult?.idToken;
      const accessToken: string | undefined =
        signInResult?.data?.accessToken || signInResult?.accessToken;
      const nativeUser: any =
        signInResult?.data?.user || signInResult?.user;

      if (!idToken) {
        // No idToken — use accessToken to fetch profile
        if (accessToken) {
          const resp = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const info = await resp.json();
          const cleanEmail = (info.email || '').trim().toLowerCase();
          const cleanName = info.name || cleanEmail.split('@')[0];
          const avatar = info.picture || '';

          // We cannot create a Firebase credential without idToken; use Google UID directly
          await persistUserLogin(
            `g_${cleanEmail}`,
            cleanEmail,
            cleanName,
            avatar,
            '',
            setUser,
            showToast,
            onClose,
            onSuccess
          );
          return true;
        }
        throw new Error('Google sign-in did not return an idToken. Please try again.');
      }

      // Exchange the Google idToken for a Firebase credential
      const credential = GoogleAuthProvider.credential(idToken, accessToken || null);
      const userCred = await signInWithCredential(auth, credential);
      const fbUser = userCred.user;

      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      const cleanName = fbUser.displayName || nativeUser?.name || cleanEmail.split('@')[0];
      const avatar = fbUser.photoURL || nativeUser?.photo || '';

      // Sync to Firestore users/{uid}
      saveUserToDb(fbUser, { name: cleanName, provider: 'google.com' }).catch(() => {});

      await persistUserLogin(
        fbUser.uid,
        cleanEmail,
        cleanName,
        avatar,
        fbUser.phoneNumber || '',
        setUser,
        showToast,
        onClose,
        onSuccess
      );
      return true;
    } catch (err: any) {
      // Handle standard Google Sign-In status codes
      if (statusCodes) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          // User dismissed the account chooser — silent
          return true;
        }
        if (err.code === statusCodes.IN_PROGRESS) {
          return true;
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setErrorMsg('Google Play Services is not available on this device.');
          return false;
        }
      }

      // DEVELOPER_ERROR (code 10) — SHA mismatch
      if (err.code === 10 || String(err.message).includes('DEVELOPER_ERROR')) {
        setErrorMsg(
          'Configuration error (code 10): SHA fingerprint mismatch. ' +
          'Run `./gradlew signingReport` and add the SHA-1/SHA-256 to the Firebase Console.'
        );
        return false;
      }

      // 12500 / 12501 — sign-in flow issues
      if (err.code === 12500) {
        setErrorMsg('Google Sign-In failed (12500). Check that your OAuth client ID is correct.');
        return false;
      }
      if (err.code === 12501) {
        setErrorMsg('Google Sign-In was cancelled (12501).');
        return true; // user cancelled, not an error
      }

      console.warn('[GoogleSignInModal] Native sign-in error:', err);
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  // ── Main button handler ───────────────────────────────────────────────────
  const handleGooglePress = async () => {
    setErrorMsg(null);
    if (Platform.OS === 'web') {
      await handleWebGoogleSignIn();
    } else if (isNativeSigninAvailable) {
      await handleNativeGoogleSignIn();
    } else {
      // Expo Go or unsupported environment
      setErrorMsg(
        'Native Google Sign-In is only available in a development build or production APK. ' +
        'Please use the email/password option instead.'
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={s.sheetHeader}>
            <Image source={brandLogo} style={s.brandIcon} contentFit="contain" />
            <Text style={s.sheetTitle}>Sign in to Dhanvikk</Text>
            <Pressable style={s.closeBtn} onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <Text style={s.sheetSub}>
            Use your Google account to access{' '}
            <Text style={s.brandHighlight}>Dhanvikk Blooms</Text>
          </Text>

          {/* ── Body ────────────────────────────────────────────────────── */}
          {busy ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>Authenticating with Google…</Text>
            </View>
          ) : (
            <View style={s.accountsList}>

              {/* Error message */}
              {errorMsg ? (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#C53030" style={{ marginRight: 6 }} />
                  <Text style={s.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* ── Primary Google button (Google Brand Guidelines) ──── */}
              <Pressable
                style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.85 }]}
                onPress={handleGooglePress}
                disabled={busy}
                accessibilityLabel="Continue with Google"
                accessibilityRole="button"
              >
                {/* Official Google "G" logo colours */}
                <View style={s.googleLogoWrap}>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                </View>
                <Text style={s.googleBtnText}>Continue with Google</Text>
              </Pressable>

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or continue with email</Text>
                <View style={s.dividerLine} />
              </View>

              {/* ── Email / Password ─────────────────────────────────── */}
              <Pressable
                style={s.emailBtn}
                onPress={() => {
                  onClose();
                  router.push('/auth/login');
                }}
                accessibilityLabel="Sign in with email and password"
              >
                <Ionicons name="mail-outline" size={20} color={colors.white} style={{ marginRight: 10 }} />
                <Text style={s.emailBtnText}>Sign in with Email & Password</Text>
              </Pressable>

              {/* ── Create account ───────────────────────────────────── */}
              <Pressable
                style={s.registerBtn}
                onPress={() => {
                  onClose();
                  router.push('/auth/register');
                }}
                accessibilityLabel="Create a new account"
              >
                <Ionicons name="person-add-outline" size={18} color={colors.primaryDeep} style={{ marginRight: 8 }} />
                <Text style={s.registerBtnText}>Create New Account</Text>
              </Pressable>
            </View>
          )}

          <Text style={s.termsText}>
            Protected by Firebase Authentication & encrypted storage.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: radius.md,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#C53030',
    lineHeight: 17,
  },
  // Google button — follows Google Brand Guidelines (white, border, shadow)
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 4,
    height: 50,
    paddingHorizontal: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleLogoWrap: {
    marginRight: 10,
    width: 20,
    alignItems: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: 0.1,
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
