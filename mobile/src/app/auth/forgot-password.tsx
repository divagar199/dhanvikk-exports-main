import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Flower2, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your account email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.brandIconWrap}>
          <View style={styles.iconCircle}>
            <Flower2 size={44} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ letterSpacing: 2 }}>
            DHANVIKK CARE
          </AppText>
          <AppText variant="h1" align="center" style={{ marginTop: 4 }}>
            Reset Password
          </AppText>
          <AppText
            variant="body"
            color={Colors.textSecondary}
            align="center"
            style={{ marginTop: 6, maxWidth: 300 }}
          >
            Enter your email to receive recovery instructions for your luxury floristry account.
          </AppText>
        </View>

        {submitted ? (
          <View style={styles.successCard}>
            <CheckCircle2 size={48} color={Colors.success} />
            <AppText variant="h2" align="center">
              Instructions Dispatched
            </AppText>
            <AppText variant="body" color={Colors.textSecondary} align="center">
              If an account is associated with {email}, you will receive a secure password reset link shortly.
            </AppText>
            <AppButton
              title="Return to Sign In"
              onPress={() => router.replace('/auth/login')}
              variant="primary"
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <AppInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@domain.com"
              icon={<Mail size={18} color={Colors.textSecondary} />}
            />

            <AppButton
              title="Send Reset Link"
              onPress={handleReset}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        )}
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 40,
  },
  brandIconWrap: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
});
