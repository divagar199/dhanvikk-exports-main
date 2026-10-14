import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfileData } from '@/services/orders';
import { saveAddress, deleteAddress } from '@/services/auth';
import { colors, radius, spacing } from '@/constants/theme';
import type { Address } from '@/types/models';
import { useStore } from '@/store/useStore';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const currentUser = useStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['profile-data', currentUser?.email],
    queryFn: getProfileData,
    enabled: !!currentUser,
  });

  const addresses: Address[] = currentUser ? (data?.savedAddresses || []) : [];

  const [modalVisible, setModalVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  // New Address Form
  const [title, setTitle] = useState('Home');
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('600001');

  const handleOpenAddModal = () => {
    if (!currentUser) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to your account to add and manage delivery addresses.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    setRecipientName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setStreet('');
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to save a delivery address.');
      return;
    }
    if (!recipientName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      return Alert.alert('Missing Details', 'Please fill in recipient name, phone, street, and city.');
    }

    setBusy(true);
    try {
      await saveAddress({
        title,
        recipientName: recipientName.trim(),
        fullName: recipientName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        streetAddress: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        pincode: postalCode.trim(),
        country: 'India',
        isDefault: addresses.length === 0,
        email: currentUser.email,
      });

      queryClient.invalidateQueries({ queryKey: ['profile-data'] });
      setModalVisible(false);
      setStreet('');
      Alert.alert('Address Saved', 'Your new delivery address has been added.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to save address.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    Alert.alert('Delete Address', 'Are you sure you want to remove this delivery address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            queryClient.invalidateQueries({ queryKey: ['profile-data'] });
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not delete address.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Delivery Addresses</Text>
        <Pressable style={s.addHeaderBtn} onPress={handleOpenAddModal}>
          <Ionicons name="add" size={20} color={colors.primaryDeep} />
          <Text style={s.addHeaderText}>Add</Text>
        </Pressable>
      </View>

      {!currentUser ? (
        <View style={s.empty}>
          <View style={s.emptyIconCircle}>
            <Ionicons name="location-outline" size={42} color={colors.primary} />
          </View>
          <Text style={s.emptyTitle}>Delivery Address Book Is Empty</Text>
          <Text style={s.emptySub}>
            No delivery addresses are stored while signed out. Sign in to your account to view or add addresses.
          </Text>
          <Pressable style={s.shopBtn} onPress={() => router.push('/auth/login')}>
            <Text style={s.shopBtnText}>Sign In to Account</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading saved addresses…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.heading}>Saved Locations ({addresses.length})</Text>

          {addresses.map((a, i) => {
            const addr = a as any;
            return (
              <View style={s.card} key={a.id || addr._id || i}>
                <View style={s.cardTop}>
                  <View style={s.tag}>
                    <Ionicons name="location" size={12} color={colors.primaryDeep} />
                    <Text style={s.tagText}>{a.title || 'Address'}</Text>
                  </View>
                  <View style={s.cardActions}>
                    {a.isDefault && (
                      <View style={s.defaultBadge}>
                        <Text style={s.defaultText}>DEFAULT</Text>
                      </View>
                    )}
                    <Pressable
                      style={s.trashBtn}
                      onPress={() => handleDeleteAddress(a.id || addr._id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>

                <Text style={s.name}>{a.recipientName || addr.fullName || 'Recipient'}</Text>
                <Text style={s.text}>
                  {a.street || addr.streetAddress}, {a.city}, {a.state}
                </Text>
                <Text style={s.text}>
                  {a.country || 'India'} - {a.postalCode || addr.pincode || ''}
                </Text>
                {a.phone ? <Text style={s.phone}>Phone: {a.phone}</Text> : null}
              </View>
            );
          })}

          {addresses.length === 0 && (
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="location-outline" size={42} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>No saved addresses yet</Text>
              <Text style={s.emptySub}>
                Add your home or office address for 1-tap express floral checkout.
              </Text>
              <Pressable style={s.shopBtn} onPress={handleOpenAddModal}>
                <Text style={s.shopBtnText}>+ Add New Address</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add New Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Delivery Address</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tag Selector */}
              <View style={s.tagRow}>
                {['Home', 'Work', 'Other'].map((t) => (
                  <Pressable
                    key={t}
                    style={[s.tagChoice, title === t && s.tagChoiceActive]}
                    onPress={() => setTitle(t)}
                  >
                    <Text style={[s.tagChoiceText, title === t && s.tagChoiceTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.inputLabel}>Recipient Full Name *</Text>
              <TextInput
                style={s.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={colors.muted}
              />

              <Text style={s.inputLabel}>Contact Phone Number *</Text>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.muted}
              />

              <Text style={s.inputLabel}>Street / Building / Apartment *</Text>
              <TextInput
                style={s.input}
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. Flat 4B, Rose Garden Towers"
                placeholderTextColor={colors.muted}
              />

              <View style={s.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>City *</Text>
                  <TextInput
                    style={s.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>PIN Code *</Text>
                  <TextInput
                    style={s.input}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="600001"
                    keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              <Text style={s.inputLabel}>State</Text>
              <TextInput
                style={s.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor={colors.muted}
              />

              <Pressable
                style={[s.saveSubmitBtn, busy && { opacity: 0.6 }]}
                onPress={handleSaveAddress}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={s.saveSubmitBtnText}>Save Address</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  addHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.muted,
  },
  content: {
    padding: spacing.md,
  },
  heading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  trashBtn: {
    padding: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  phone: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  shopBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  tagChoice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.pale,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  tagChoiceTextActive: {
    color: colors.white,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  input: {
    height: 46,
    backgroundColor: colors.pale,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  saveSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveSubmitBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});