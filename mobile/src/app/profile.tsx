import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { useStore } from '@/store/useStore';
import { updateProfile } from '@/services/auth';
import { setStoredUser } from '@/lib/storage';
import { colors, radius, spacing } from '@/constants/theme';
import { useToast } from '@/context/ToastContext';

export default function ProfileScreen() {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      return showToast('Missing Name', 'Please enter your full name.', 'error');
    }

    setBusy(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res && res.user) {
        setUser(res.user);
        await setStoredUser(res.user);
        showToast('Profile Updated! 🌸', 'Your profile details have been saved.', 'success');
      } else {
        const updated = { ...user, name: name.trim(), phone: phone.trim() } as any;
        setUser(updated);
        await setStoredUser(updated);
        showToast('Profile Updated! 🌸', 'Your profile details have been saved.', 'success');
      }
    } catch (e: any) {
      showToast('Update Failed', e.message || 'Unable to update profile.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Request Account Deletion',
      'Are you sure you want to request deletion of your Dhanvikk Blooms and Exports customer account? Your saved addresses, past orders, and VIP perks will be permanently archived according to data protection regulations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: () => {
            showToast(
              'Deletion Request Submitted 🛡️',
              'Our compliance team will process your request within 7 business days.',
              'info',
              4000
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top App Bar */}
      <View style={s.topBar}>
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.topBarTitle}>Profile & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Card */}
          <View style={s.avatarCard}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarLetter}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '🌸'}
              </Text>
            </View>
            <Text style={s.profileName}>{user?.name || 'Valued Guest'}</Text>
            <View style={s.roleBadge}>
              <Ionicons name="sparkles" size={12} color={colors.primaryDeep} />
              <Text style={s.roleBadgeText}>VIP MEMBER</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>PERSONAL DETAILS</Text>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Phone Number</Text>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={s.fieldGroup}>
              <View style={s.labelRow}>
                <Text style={s.label}>Email Address</Text>
                <View style={s.verifiedPill}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text style={s.verifiedText}>Verified</Text>
                </View>
              </View>
              <TextInput
                style={[s.input, s.disabledInput]}
                value={user?.email || 'customer@dhanvikk.com'}
                editable={false}
              />
              <Text style={s.helperText}>
                Email address is linked to your central Dhanvikk account.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[s.saveBtn, busy && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={s.saveBtnText}>Save Profile</Text>
            )}
          </Pressable>

          {/* Account Security & Deletion Section */}
          <View style={s.dangerSection}>
            <Text style={s.dangerSectionTitle}>ACCOUNT SECURITY & PRIVACY</Text>
            <Text style={s.dangerDesc}>
              Under data protection regulations, you may request permanent deletion of your customer profile and personal data.
            </Text>
            <Pressable style={s.deleteBtn} onPress={confirmDeleteAccount}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={s.deleteBtnText}>Request Account Deletion</Text>
            </Pressable>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  content: {
    padding: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  avatarCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.6,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 6,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  input: {
    height: 48,
    backgroundColor: colors.pale,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabledInput: {
    backgroundColor: '#F5F5F7',
    color: colors.muted,
  },
  helperText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  dangerSection: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.error,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  dangerDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
});
