import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, User, Mail, Phone, Calendar, Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { getUserAvatarUrl } from '../utils/imageUrl';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email] = useState(user?.email || 'priya.sharma@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 00000');
  const [occasion, setOccasion] = useState('Anniversary');

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name,
        phone,
      });
    }
    showToast('Profile updated successfully 🌸', 'success');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          Edit Profile
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          {/* Avatar Preview */}
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: getUserAvatarUrl(user) }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.cameraBadge}>
              <Camera size={14} color={Colors.white} />
            </View>
          </View>

          <AppInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            icon={<User size={18} color={Colors.textSecondary} />}
          />

          <AppInput
            label="Email Address (Registered)"
            value={email}
            editable={false}
            icon={<Mail size={18} color={Colors.textSecondary} />}
            style={{ color: Colors.textSecondary }}
          />

          <AppInput
            label="Contact Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textSecondary} />}
          />

          <AppInput
            label="Preferred Gifting Occasion"
            value={occasion}
            onChangeText={setOccasion}
            placeholder="e.g. Birthday, Anniversary"
            icon={<Calendar size={18} color={Colors.textSecondary} />}
          />

          <AppButton
            title="Save Profile"
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  avatarWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
