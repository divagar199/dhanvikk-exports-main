import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flower2 } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { GrandLogo } from '../../components/GrandLogo';
import GoogleAuthModal from '../../components/GoogleAuthModal';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleWelcomeLogin = async () => {
    try {
      const res = await authService.redirectToGoogleLoginPage();
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        showToast(`Welcome to Dhanvikk Blooms, ${res.user.name}! 🌸`, 'success');
        router.replace('/(tabs)/account');
        return;
      }
      if (res.cancelled) return;
      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Editorial Botanical Background Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
        }}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      <View style={styles.scrim} />

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Top Grand Brand Mark */}
        <View style={styles.brandHeader}>
          <View style={styles.logoMedallion}>
            <GrandLogo
              size="lg"
              light={false}
              showSubtitle={true}
              subtitleText="BLOOMS & EXPORTS"
            />
          </View>
        </View>

        {/* Bottom Hero & Actions */}
        <View style={styles.bottomSection}>
          <View style={styles.pillBadge}>
            <Flower2 size={14} color={Colors.gold} />
            <AppText
              variant="caption"
              color={Colors.white}
              weight="semiBold"
              style={{ marginLeft: 6 }}
            >
              LUXURY FLORAL COMMERCE
            </AppText>
          </View>

          <AppText variant="display" color={Colors.white} style={styles.headline}>
            Curated blooms,{'\n'}delivered beautifully.
          </AppText>

          <AppText
            variant="body"
            color="rgba(255, 255, 255, 0.85)"
            style={styles.subtext}
          >
            Experience hand-conditioned Ecuadorian roses, Parisian velvet boxes, and eternal flowers flown in fresh daily.
          </AppText>

          <View style={styles.buttonsContainer}>
            <AppButton
              title="Sign In"
              onPress={() => router.push('/auth/login')}
              variant="primary"
              size="large"
              fullWidth
            />

            <AppButton
              title="Create Account"
              onPress={() => router.push('/auth/register')}
              variant="secondary"
              size="large"
              fullWidth
            />

            <TouchableOpacity
              style={styles.googleWelcomeBtn}
              activeOpacity={0.85}
              onPress={handleGoogleWelcomeLogin}
            >
              <Image
                source={{
                  uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                }}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
              <AppText variant="bodySm" weight="semiBold" color={Colors.text}>
                Continue with Google
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.guestLink}
            >
              <AppText variant="button" color={Colors.white} weight="medium">
                Continue as Guest →
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => router.replace('/(tabs)/account')}
      />
    </View>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 27, 31, 0.58)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
  },
  brandHeader: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  logoMedallion: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...Shadows.md,
  },
  bottomSection: {
    paddingBottom: Spacing.xl,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.chip,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  headline: {
    marginBottom: Spacing.md,
    lineHeight: 44,
  },
  subtext: {
    marginBottom: Spacing.huge,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 12,
    alignItems: 'center',
  },
  guestLink: {
    paddingVertical: 12,
  },
  googleWelcomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.button,
    height: 52,
    width: '100%',
    gap: 10,
    ...Shadows.sm,
  },
});
