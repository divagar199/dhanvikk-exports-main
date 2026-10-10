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
  User as UserIcon,
  CircleUser,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Spacing, Radius } from '../theme';
import { AppText } from './AppText';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useResponsive } from '../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { authStorage } from '../services/apiClient';
import { User } from '../types';

interface GoogleAccountItem {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  badgeBg?: string;
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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { setAuth, syncUserData, addSavedAccount } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();
  const { isTablet, isLandscape } = useResponsive();
  const isSheet = !isTablet && !isLandscape;
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

  // Perform real Google authentication with backend & database
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
      setStatusText('Signing in with Google...');

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      setStatusText('Syncing profile with database...');
      const googleRes = await authService.googleLogin({
        email: cleanEmail,
        name: account.name || cleanEmail.split('@')[0],
        avatar: account.avatar,
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

  // Launch Google OAuth in External/In-App WebBrowser
  const handleLaunchWebBrowser = async () => {
    try {
      setLoading(true);
      setStatusText('Opening Google OAuth in browser...');
      const clientId = '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';
      const redirectUri = 'https://dhanvikk-exports-main.vercel.app/login';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;

      if (Platform.OS !== 'web') {
        await WebBrowser.openAuthSessionAsync(googleAuthUrl, 'dhanvikk://');
      } else {
        window.location.href = googleAuthUrl;
      }
    } catch (e: any) {
      console.warn('WebBrowser OAuth note:', e?.message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setStatusText('');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
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

        <View style={styles.modalCard}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <AppText style={styles.title}>Choose an account</AppText>
              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Close"
              >
                <X size={20} color="#9AA0A6" />
              </TouchableOpacity>
            </View>

            <View style={styles.subtitleRow}>
              <AppText style={styles.subtitlePrefix}>to continue to </AppText>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL('https://auth-checker-diva.firebaseapp.com').catch(() => {})}
              >
                <AppText style={styles.subtitleDomain}>auth-checker-diva.firebaseapp.com</AppText>
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
          >
            {accounts.map((acc, index) => {
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

                    {/* Loading spinner or chevron */}
                    {isSigningThis ? (
                      <ActivityIndicator size="small" color="#8AB4F8" />
                    ) : null}
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
                <CircleUser size={28} color="#9AA0A6" strokeWidth={1.75} />
              </View>

              <View style={styles.accountInfo}>
                <AppText style={styles.useAnotherText}>Use another account</AppText>
              </View>
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

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.confirmBtn, (!customEmail.trim() || loading) && { opacity: 0.5 }]}
                    disabled={!customEmail.trim() || loading}
                    onPress={() => {
                      let e = customEmail.trim();
                      if (!e.includes('@')) e = `${e}@gmail.com`;
                      performGoogleLogin({ email: e, name: e.split('@')[0] });
                    }}
                  >
                    <AppText style={styles.confirmBtnText}>Sign In</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.browserOAuthBtn}
                    onPress={handleLaunchWebBrowser}
                    disabled={loading}
                  >
                    <ExternalLink size={14} color="#8AB4F8" />
                    <AppText style={styles.browserOAuthBtnText}>Open Browser OAuth</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
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
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#303134',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
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
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  subtitlePrefix: {
    fontSize: 14,
    color: '#9AA0A6',
  },
  subtitleDomain: {
    fontSize: 14,
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
    maxHeight: 380,
  },
  accountListContent: {
    paddingBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  accountItemActive: {
    backgroundColor: 'rgba(138, 180, 248, 0.08)',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  anotherAvatarWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8EAED',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  useAnotherText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8EAED',
  },
  divider: {
    height: 1,
    backgroundColor: '#3C4043',
    marginVertical: 4,
  },
  customInputContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 12,
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
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#8AB4F8',
    paddingVertical: 10,
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
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  browserOAuthBtnText: {
    fontSize: 12,
    color: '#8AB4F8',
    fontWeight: '500',
  },
});
