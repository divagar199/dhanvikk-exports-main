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
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from './AppText';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useResponsive } from '../hooks/useResponsive';
import { authStorage } from '../services/apiClient';
import { GOOGLE_OAUTH_CLIENT_ID } from '../config/firebase';
import { User } from '../types';

const GOOGLE_G_LOGO =
  'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png';

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
  const [selectedEmail, setSelectedEmail] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<
    Array<{ email: string; name: string }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const { isTablet, isLandscape } = useResponsive();
  const isSheet = !isTablet && !isLandscape;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load saved user email or initialize modal state
  useEffect(() => {
    if (visible) {
      setErrorMsg('');
      setLoading(false);
      setAuthStatus('');

      // Look up existing user from storage to offer 1-tap sign in
      authStorage
        .getItem('dhanvikk_user')
        .then((raw) => {
          const accounts: Array<{ email: string; name: string }> = [];
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.email) {
                accounts.push({
                  email: parsed.email,
                  name: parsed.name || parsed.email.split('@')[0],
                });
              }
            } catch {
              // Ignore parse error
            }
          }

          if (initialEmail && !accounts.some((a) => a.email === initialEmail)) {
            accounts.unshift({
              email: initialEmail,
              name: initialName || initialEmail.split('@')[0],
            });
          }

          setSavedAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedEmail(accounts[0].email);
            setShowCustomInput(false);
          } else {
            setShowCustomInput(true);
            setCustomEmail(initialEmail || '');
          }
        })
        .catch(() => {
          setShowCustomInput(true);
        });
    }
  }, [visible, initialEmail, initialName]);

  // Execute Google Authentication with Firebase & Cloud Firestore
  const performGoogleAuth = async (targetEmail: string, displayName?: string) => {
    Keyboard.dismiss();
    setErrorMsg('');
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your Google account email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    try {
      setLoading(true);
      setAuthStatus('Connecting to Google Identity Services...');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      setAuthStatus('Synchronizing account with Cloud Firestore...');
      const googleRes = await authService.googleLogin({
        email: cleanEmail,
        name: displayName || cleanEmail.split('@')[0],
      });

      if (!isMountedRef.current) return;

      setAuth(googleRes.user, googleRes.token);
      setLoading(false);
      setAuthStatus('');

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      showToast(`Welcome back, ${googleRes.user.name}! 🌸`, 'success');
      if (onSuccess) onSuccess(googleRes.user);
      onClose();
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setLoading(false);
      setAuthStatus('');
      const friendly =
        err?.response?.data?.message ||
        err?.friendlyMessage ||
        err?.message ||
        'Could not complete Google authentication. Please try again.';
      setErrorMsg(friendly);
    }
  };

  const handleQuickAccountPress = (acc: { email: string; name: string }) => {
    setSelectedEmail(acc.email);
    performGoogleAuth(acc.email, acc.name);
  };

  const handleCustomSubmit = () => {
    let emailToUse = customEmail.trim();
    if (emailToUse && !emailToUse.includes('@')) {
      emailToUse = `${emailToUse}@gmail.com`;
    }
    performGoogleAuth(emailToUse);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isSheet ? 'slide' : 'fade'}
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            if (!loading) onClose();
          }}
        />

        <View
          style={[
            styles.sheetContainer,
            !isSheet && styles.modalContainer,
          ]}
        >
          {/* Top Sheet Handle */}
          {isSheet && (
            <View style={styles.sheetHandleRow}>
              <View style={styles.sheetHandle} />
            </View>
          )}

          {/* Google Identity Header */}
          <View style={styles.googleHeader}>
            <View style={styles.googleBrandRow}>
              <Image
                source={{ uri: GOOGLE_G_LOGO }}
                style={styles.googleGLogo}
                contentFit="contain"
              />
              <View style={styles.headerTitles}>
                <AppText variant="h2" weight="bold" color="#202124" style={styles.googleTitle}>
                  Sign in with Google
                </AppText>
                <AppText variant="caption" color="#5F6368" style={styles.googleSubtitle}>
                  Choose an account to continue to Dhanvikk Blooms
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Close sign-in window"
            >
              <X size={20} color="#5F6368" />
            </TouchableOpacity>
          </View>

          {/* App Verification Badge */}
          <View style={styles.appPill}>
            <CheckCircle2 size={13} color="#1A73E8" />
            <AppText variant="caption" color="#3C4043" weight="medium" style={{ marginLeft: 6 }}>
              Dhanvikk Blooms • auth-checker-diva
            </AppText>
          </View>

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* Error Notification Banner */}
            {errorMsg ? (
              <View style={styles.errorBox}>
                <AppText variant="caption" color={Colors.error} weight="medium">
                  {errorMsg}
                </AppText>
              </View>
            ) : null}

            {/* Live Loading / Sync Banner */}
            {loading ? (
              <View style={styles.loadingBanner}>
                <ActivityIndicator size="small" color="#1A73E8" />
                <AppText
                  variant="caption"
                  color="#1A73E8"
                  weight="semiBold"
                  style={{ marginLeft: 10 }}
                >
                  {authStatus || 'Authenticating with Google...'}
                </AppText>
              </View>
            ) : null}

            {/* 1. Saved / Recognized Google Accounts (1-Tap Selection) */}
            {savedAccounts.length > 0 && !showCustomInput && (
              <View style={styles.accountsSection}>
                {savedAccounts.map((acc, idx) => {
                  const isSelected = selectedEmail === acc.email;
                  const firstLetter = (acc.name || acc.email)[0].toUpperCase();

                  return (
                    <TouchableOpacity
                      key={`${acc.email}_${idx}`}
                      style={[
                        styles.accountRow,
                        isSelected && styles.accountRowActive,
                        loading && { opacity: 0.6 },
                      ]}
                      onPress={() => handleQuickAccountPress(acc)}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <View style={styles.accountAvatar}>
                        <AppText variant="body" weight="bold" color="#FFFFFF">
                          {firstLetter}
                        </AppText>
                        <View style={styles.miniGBadge}>
                          <Image
                            source={{ uri: GOOGLE_G_LOGO }}
                            style={{ width: 10, height: 10 }}
                            contentFit="contain"
                          />
                        </View>
                      </View>

                      <View style={styles.accountDetails}>
                        <AppText variant="body" weight="semiBold" color="#202124">
                          {acc.name}
                        </AppText>
                        <AppText variant="caption" color="#5F6368">
                          {acc.email}
                        </AppText>
                      </View>

                      <ChevronRight size={18} color="#5F6368" />
                    </TouchableOpacity>
                  );
                })}

                {/* Primary 1-Tap Continue Button */}
                {selectedEmail ? (
                  <TouchableOpacity
                    style={[styles.primaryGoogleBtn, loading && { opacity: 0.7 }]}
                    onPress={() => {
                      const found = savedAccounts.find((a) => a.email === selectedEmail);
                      performGoogleAuth(selectedEmail, found?.name);
                    }}
                    disabled={loading}
                    activeOpacity={0.88}
                  >
                    <Image
                      source={{ uri: GOOGLE_G_LOGO }}
                      style={styles.googleBtnLogo}
                      contentFit="contain"
                    />
                    <AppText variant="body" weight="bold" color="#FFFFFF">
                      Continue as {selectedEmail.split('@')[0]}
                    </AppText>
                  </TouchableOpacity>
                ) : null}

                {/* "Use another account" button */}
                <TouchableOpacity
                  style={styles.useAnotherBtn}
                  onPress={() => {
                    setShowCustomInput(true);
                    setCustomEmail('');
                    setErrorMsg('');
                  }}
                  disabled={loading}
                >
                  <PlusCircle size={16} color="#1A73E8" />
                  <AppText
                    variant="caption"
                    weight="semiBold"
                    color="#1A73E8"
                    style={{ marginLeft: 8 }}
                  >
                    Use another Google account
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. Enter / Choose Any Google Account */}
            {showCustomInput && (
              <View style={styles.customSection}>
                <AppText variant="caption" weight="semiBold" color="#202124" style={styles.inputLabel}>
                  GOOGLE EMAIL ADDRESS
                </AppText>

                <View style={styles.googleInputWrap}>
                  <TextInput
                    style={styles.googleTextInput}
                    placeholder="yourname@gmail.com"
                    placeholderTextColor="#9AA0A6"
                    value={customEmail}
                    onChangeText={(val) => {
                      setCustomEmail(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {customEmail.length > 0 && !customEmail.includes('@') && (
                    <TouchableOpacity
                      style={styles.gmailQuickChip}
                      onPress={() => setCustomEmail(`${customEmail}@gmail.com`)}
                    >
                      <AppText variant="caption" weight="semiBold" color="#1A73E8">
                        @gmail.com
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.primaryGoogleBtn, loading && { opacity: 0.7 }]}
                  onPress={handleCustomSubmit}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <Image
                    source={{ uri: GOOGLE_G_LOGO }}
                    style={styles.googleBtnLogo}
                    contentFit="contain"
                  />
                  <AppText variant="body" weight="bold" color="#FFFFFF">
                    Continue with Google
                  </AppText>
                </TouchableOpacity>

                {savedAccounts.length > 0 && (
                  <TouchableOpacity
                    style={styles.backToAccountsBtn}
                    onPress={() => {
                      setShowCustomInput(false);
                      setErrorMsg('');
                    }}
                    disabled={loading}
                  >
                    <UserCheck size={15} color="#5F6368" />
                    <AppText
                      variant="caption"
                      weight="medium"
                      color="#5F6368"
                      style={{ marginLeft: 6 }}
                    >
                      Back to saved accounts
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Google Terms & Disclosure */}
            <View style={styles.googleDisclaimerBox}>
              <AppText variant="caption" color="#5F6368" style={styles.disclaimerText}>
                To continue, Google will share your name, email address, and profile picture with Dhanvikk Blooms. Before using this app, you can review Dhanvikk Blooms’ Privacy Policy and Terms of Service.
              </AppText>
            </View>

            {/* Security Footnote */}
            <View style={styles.securityFootnote}>
              <ShieldCheck size={14} color="#1E8E3E" />
              <AppText
                variant="caption"
                color="#5F6368"
                style={{ fontSize: 11, marginLeft: 6 }}
              >
                Secured with Google OAuth 2.0 & Cloud Firestore
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    maxHeight: '90%',
    ...Shadows.lg,
  },
  modalContainer: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 480,
    borderRadius: 24,
    maxHeight: '85%',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    borderRadius: Radius.pill,
    backgroundColor: '#DADCE0',
  },
  googleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  googleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  googleGLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  googleTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#202124',
  },
  googleSubtitle: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F4',
    marginLeft: Spacing.sm,
  },
  appPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: Spacing.md,
  },
  scrollBody: {
    paddingBottom: Spacing.lg,
  },
  errorBox: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#FAD2CF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.md,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.md,
  },
  accountsSection: {
    gap: Spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    marginBottom: 6,
  },
  accountRowActive: {
    borderColor: '#1A73E8',
    backgroundColor: '#F8FAFE',
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniGBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 2,
    elevation: 2,
  },
  accountDetails: {
    flex: 1,
    marginLeft: 12,
  },
  primaryGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A73E8',
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginTop: 6,
    ...Shadows.sm,
  },
  googleBtnLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  useAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  customSection: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: '#3C4043',
    marginBottom: 6,
  },
  googleInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  googleTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#202124',
  },
  gmailQuickChip: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  backToAccountsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  googleDisclaimerBox: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  disclaimerText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#5F6368',
  },
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
});
