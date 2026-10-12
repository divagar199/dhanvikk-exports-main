import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  CircleUser,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius } from '../theme';
import { AppText } from './AppText';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useResponsive } from '../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { authStorage } from '../services/apiClient';
import { User } from '../types';
import { auth, GoogleAuthProvider } from '../config/firebase';

interface GoogleAccountItem {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  badgeBg?: string;
  isCustom?: boolean;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    name: 'Divagar M',
    email: 'divagar.m.msc.cs@gmail.com',
    initials: 'D',
    badgeBg: '#1A73E8',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'krishna m_bca_b_ 26',
    email: 'krishna.m.bca1727@gmail.com',
    initials: 'K',
    badgeBg: '#34A853',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'xZirexa Tech',
    email: 'xzirexatech@gmail.com',
    initials: 'xZ',
    badgeBg: '#7C3AED',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  },
];

const GOOGLE_G_LOGO = 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png';
const FIREBASE_AUTH_DOMAIN = 'auth-checker-1-main.firebaseapp.com';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialName?: string;
  onSuccess?: (user: User) => void;
}

export default function GoogleAuthModal({
  visible,
  onClose,
  initialEmail = '',
  initialName = '',
  onSuccess,
}: GoogleAuthModalProps) {
  const [accounts, setAccounts] = useState<GoogleAccountItem[]>(DEFAULT_GOOGLE_ACCOUNTS);
  const [activeSigningEmail, setActiveSigningEmail] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { setAuth, syncUserData, addSavedAccount } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();
  const { isTablet, isLandscape } = useResponsive();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize and load accounts on modal open
  useEffect(() => {
    if (!visible) return;

    setErrorMsg('');
    setLoading(false);
    setStatusText('');
    setActiveSigningEmail(null);
    setShowCustomInput(false);
    setCustomEmail('');
    setCustomName('');

    authStorage.getItem('dhanvikk_saved_accounts').then((raw) => {
      if (!isMountedRef.current) return;
      const combined = [...DEFAULT_GOOGLE_ACCOUNTS];
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved)) {
            for (const s of saved) {
              if (s?.email && !combined.some((x) => x.email.toLowerCase() === s.email.toLowerCase())) {
                combined.push({
                  name: s.name || s.email.split('@')[0],
                  email: s.email,
                  initials: (s.name || s.email)[0].toUpperCase(),
                  badgeBg: '#4285F4',
                  isCustom: true,
                });
              }
            }
          }
        } catch {}
      }
      if (initialEmail && !combined.some((x) => x.email.toLowerCase() === initialEmail.toLowerCase())) {
        combined.unshift({
          name: initialName || initialEmail.split('@')[0],
          email: initialEmail,
          initials: (initialName || initialEmail)[0].toUpperCase(),
          badgeBg: '#EA4335',
          isCustom: true,
        });
      }
      setAccounts(combined);
    });
  }, [visible, initialEmail, initialName]);

  const handleDismiss = () => {
    if (loading) return;
    setErrorMsg('');
    setLoading(false);
    setStatusText('');
    setActiveSigningEmail(null);
    onClose();
  };

  // Perform Google authentication with backend & database
  const performGoogleLogin = async (account: { name: string; email: string; avatar?: string }) => {
    Keyboard.dismiss();
    setErrorMsg('');
    const cleanEmail = account.email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please select or enter a Google account.');
      return;
    }

    try {
      setLoading(true);
      setActiveSigningEmail(cleanEmail);
      setStatusText('Connecting to Google...');

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      setStatusText('Syncing profile with Dhanvikk database...');
      const googleRes = await authService.googleLogin({
        email: cleanEmail,
        name: account.name || cleanEmail.split('@')[0],
        avatar: account.avatar || `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}`,
      });

      if (!isMountedRef.current) return;

      setAuth(googleRes.user, googleRes.token);
      await addSavedAccount(cleanEmail, googleRes.user.name);
      await syncUserData(cleanEmail);

      setLoading(false);
      setStatusText('');
      setActiveSigningEmail(null);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      showToast(`Welcome back, ${googleRes.user.name}! 🌸`, 'success');
      onClose();

      if (onSuccess) {
        onSuccess(googleRes.user);
      } else {
        router.replace('/(tabs)/account');
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setLoading(false);
      setStatusText('');
      setActiveSigningEmail(null);
      const friendly =
        err?.response?.data?.message ||
        err?.friendlyMessage ||
        err?.message ||
        'Could not complete Google authentication. Please try again.';
      setErrorMsg(friendly);
    }
  };

  // Web Browser / Web-Popup Google Authentication (for Web runtime)
  const handleWebPopupSignIn = async () => {
    if (Platform.OS === 'web') {
      try {
        setLoading(true);
        setStatusText('Opening Google account chooser...');
        const { signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const cleanEmail = fbUser.email || '';
        const name = fbUser.displayName || cleanEmail.split('@')[0];
        const avatar = fbUser.photoURL || '';

        await performGoogleLogin({ email: cleanEmail, name, avatar });
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setLoading(false);
        setStatusText('');
        if (err?.code !== 'auth/popup-closed-by-user') {
          setErrorMsg(err?.message || 'Google sign-in popup encountered an error.');
        }
      }
    } else {
      // On mobile native, prompt custom email input
      setShowCustomInput(true);
    }
  };

  // Remove a custom saved account from the list
  const handleRemoveAccount = async (emailToRemove: string) => {
    const updated = accounts.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    setAccounts(updated);
    try {
      const raw = await authStorage.getItem('dhanvikk_saved_accounts');
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          const filtered = saved.filter((s) => s?.email?.toLowerCase() !== emailToRemove.toLowerCase());
          await authStorage.setItem('dhanvikk_saved_accounts', JSON.stringify(filtered));
        }
      }
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleDismiss}
        />

        <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.logoAndTitleWrap}>
                <Image
                  source={{ uri: GOOGLE_G_LOGO }}
                  style={styles.googleLogo}
                  contentFit="contain"
                />
                <AppText style={styles.title}>Choose an account</AppText>
              </View>

              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close account chooser"
              >
                <X size={20} color="#9AA0A6" />
              </TouchableOpacity>
            </View>

            <View style={styles.subtitleRow}>
              <AppText style={styles.subtitlePrefix}>to continue to </AppText>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL(`https://${FIREBASE_AUTH_DOMAIN}`).catch(() => {})}
              >
                <AppText style={styles.subtitleDomain}>Dhanvikk Blooms</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message Banner */}
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <AppText style={styles.errorText}>{errorMsg}</AppText>
            </View>
          ) : null}

          {/* Loading Progress Indicator */}
          {loading && statusText ? (
            <View style={styles.loadingBanner}>
              <ActivityIndicator size="small" color="#8AB4F8" style={{ marginRight: 10 }} />
              <AppText style={styles.loadingText}>{statusText}</AppText>
            </View>
          ) : null}

          {/* Account List */}
          <ScrollView
            style={styles.accountList}
            contentContainerStyle={styles.accountListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {accounts.map((acc) => {
              const isSigningThis = activeSigningEmail === acc.email.toLowerCase();

              return (
                <View key={acc.email}>
                  <TouchableOpacity
                    style={[styles.accountItem, isSigningThis && styles.accountItemActive]}
                    activeOpacity={0.65}
                    onPress={() => performGoogleLogin(acc)}
                    disabled={loading}
                  >
                    {/* Account Avatar */}
                    <View style={styles.avatarWrap}>
                      {acc.avatar ? (
                        <Image
                          source={{ uri: acc.avatar }}
                          style={styles.avatarImg}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: acc.badgeBg || '#1A73E8' }]}>
                          <AppText style={styles.avatarInitials}>{acc.initials || acc.name[0]}</AppText>
                        </View>
                      )}
                    </View>

                    {/* Account Info */}
                    <View style={styles.accountInfo}>
                      <AppText style={styles.accountName} numberOfLines={1}>
                        {acc.name}
                      </AppText>
                      <AppText style={styles.accountEmail} numberOfLines={1}>
                        {acc.email}
                      </AppText>
                    </View>

                    {/* Loading spinner, remove button, or chevron */}
                    {isSigningThis ? (
                      <ActivityIndicator size="small" color="#8AB4F8" />
                    ) : acc.isCustom ? (
                      <TouchableOpacity
                        onPress={() => handleRemoveAccount(acc.email)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.removeBtn}
                      >
                        <Trash2 size={16} color="#5F6368" />
                      </TouchableOpacity>
                    ) : (
                      <ChevronRight size={18} color="#5F6368" />
                    )}
                  </TouchableOpacity>

                  {/* Horizontal Divider Line */}
                  <View style={styles.divider} />
                </View>
              );
            })}

            {/* "Use another account" Row */}
            <TouchableOpacity
              style={styles.accountItem}
              activeOpacity={0.65}
              onPress={() => {
                setShowCustomInput((prev) => !prev);
                setErrorMsg('');
              }}
              disabled={loading}
            >
              <View style={styles.anotherAvatarWrap}>
                <CircleUser size={26} color="#9AA0A6" strokeWidth={1.75} />
              </View>

              <View style={styles.accountInfo}>
                <AppText style={styles.useAnotherText}>Use another account</AppText>
              </View>

              <ChevronRight size={18} color="#5F6368" />
            </TouchableOpacity>

            {/* Expandable Custom Email Input */}
            {showCustomInput ? (
              <View style={styles.customInputContainer}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Google email address"
                    placeholderTextColor="#5F6368"
                    value={customEmail}
                    onChangeText={(val) => {
                      setCustomEmail(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {customEmail.length > 0 && !customEmail.includes('@') ? (
                    <TouchableOpacity
                      style={styles.gmailChip}
                      onPress={() => setCustomEmail(`${customEmail}@gmail.com`)}
                    >
                      <AppText style={styles.gmailChipText}>+ @gmail.com</AppText>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your Name (optional)"
                    placeholderTextColor="#5F6368"
                    value={customName}
                    onChangeText={setCustomName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.confirmBtn, (!customEmail.trim() || loading) && { opacity: 0.5 }]}
                    disabled={!customEmail.trim() || loading}
                    onPress={() => {
                      let e = customEmail.trim();
                      if (!e.includes('@')) e = `${e}@gmail.com`;
                      const n = customName.trim() || e.split('@')[0];
                      performGoogleLogin({ email: e, name: n });
                    }}
                  >
                    <AppText style={styles.confirmBtnText}>Sign In with Google</AppText>
                  </TouchableOpacity>

                  {Platform.OS === 'web' ? (
                    <TouchableOpacity
                      style={styles.browserOAuthBtn}
                      onPress={handleWebPopupSignIn}
                      disabled={loading}
                    >
                      <ExternalLink size={14} color="#8AB4F8" />
                      <AppText style={styles.browserOAuthBtnText}>Google Popup</AppText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Bottom Google Privacy & Terms Notice */}
            <View style={styles.footerNote}>
              <AppText style={styles.footerText}>
                To continue, Google will share your name, email address, and profile picture with Dhanvikk Blooms.
                See Dhanvikk's{' '}
                <AppText
                  style={styles.footerLink}
                  onPress={() => router.push('/privacy' as any)}
                >
                  Privacy Policy
                </AppText>{' '}
                and{' '}
                <AppText
                  style={styles.footerLink}
                  onPress={() => router.push('/terms' as any)}
                >
                  Terms of Service
                </AppText>
                .
              </AppText>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#131314', // Exact Google Dark Mode Surface
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#303134',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  modalCardTablet: {
    maxWidth: 480,
    paddingHorizontal: 28,
  },
  header: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoAndTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleLogo: {
    width: 26,
    height: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingLeft: 38,
  },
  subtitlePrefix: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  subtitleDomain: {
    fontSize: 13,
    color: '#8AB4F8',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: 'rgba(234, 67, 53, 0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  errorText: {
    fontSize: 13,
    color: '#F28B82',
    lineHeight: 18,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 180, 248, 0.12)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 180, 248, 0.25)',
  },
  loadingText: {
    fontSize: 13,
    color: '#8AB4F8',
    fontWeight: '500',
  },
  accountList: {
    maxHeight: 400,
  },
  accountListContent: {
    paddingBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  accountItemActive: {
    backgroundColor: 'rgba(138, 180, 248, 0.08)',
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  anotherAvatarWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accountInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E8EAED',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  useAnotherText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E8EAED',
  },
  removeBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#303134',
    marginVertical: 2,
  },
  customInputContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#1E1F20',
    borderWidth: 1,
    borderColor: '#5F6368',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  gmailChip: {
    position: 'absolute',
    right: 10,
    top: 9,
    backgroundColor: '#2D2F31',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gmailChipText: {
    fontSize: 11,
    color: '#8AB4F8',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#8AB4F8',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#041E49',
    fontSize: 14,
    fontWeight: 'bold',
  },
  browserOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 180, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(138, 180, 248, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  browserOAuthBtnText: {
    fontSize: 12,
    color: '#8AB4F8',
    fontWeight: '500',
  },
  footerNote: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#202124',
    paddingHorizontal: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#9AA0A6',
    lineHeight: 16,
  },
  footerLink: {
    fontSize: 11,
    color: '#8AB4F8',
    fontWeight: '500',
  },
});
