import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import {
  cancelSpeechRecognition,
  startSpeechRecognition,
  stopSpeechRecognition,
} from '@/services/voiceSearch';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

const VOICE_SUGGESTIONS = [
  'Crimson Roses',
  'Casablanca Lilies',
  'Luxury Bouquets',
  'Dawn Nilgiri Harvest',
  'Orchids',
  'Birthday Bouquets',
];

export function VoiceSearchModal({
  visible,
  onClose,
  onSelectQuery,
}: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening… Speak now');
  const [hasError, setHasError] = useState(false);

  // Pulse animation for mic circle
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulsing = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulsing = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const beginListening = async () => {
    setHasError(false);
    setSpokenText('');
    setStatusMessage('Listening… Speak your floral inquiry');
    setIsListening(true);
    startPulsing();

    const started = await startSpeechRecognition({
      onStart: () => {
        setIsListening(true);
        setStatusMessage('Listening… Speak now');
      },
      onPartialResult: (text) => {
        setSpokenText(text);
        setStatusMessage('Transcribing voice…');
      },
      onResult: (finalText) => {
        setIsListening(false);
        stopPulsing();
        setSpokenText(finalText);
        setStatusMessage('Speech recognized!');
        // Automatically submit the recognized voice search
        setTimeout(() => {
          onSelectQuery(finalText);
          onClose();
        }, 500);
      },
      onError: (errMsg) => {
        setIsListening(false);
        stopPulsing();
        setHasError(true);
        setStatusMessage(errMsg || 'No speech heard. Tap mic to retry.');
      },
      onEnd: () => {
        setIsListening(false);
        stopPulsing();
      },
    });

    if (!started) {
      setIsListening(false);
      stopPulsing();
      setHasError(true);
      setStatusMessage('Voice recognition not ready. Try speaking or choose below.');
    }
  };

  useEffect(() => {
    if (visible) {
      beginListening();
    } else {
      stopPulsing();
      cancelSpeechRecognition();
      setIsListening(false);
      setSpokenText('');
    }
    return () => {
      stopPulsing();
      cancelSpeechRecognition();
    };
  }, [visible]);

  const handleMicTap = () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      stopPulsing();
    } else {
      beginListening();
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    cancelSpeechRecognition();
    onSelectQuery(suggestion);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header Row */}
          <View style={s.headerRow}>
            <View style={s.brandRow}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={s.headerTitle}>Voice Search</Text>
            </View>
            <Pressable
              style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          {/* Status Message */}
          <Text style={[s.statusText, hasError && s.statusTextError]}>
            {statusMessage}
          </Text>

          {/* Central Pulsing Mic Button */}
          <View style={s.micWrap}>
            {isListening && (
              <Animated.View
                style={[
                  s.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
            )}
            <Pressable
              style={({ pressed }) => [
                s.micCircle,
                isListening ? s.micCircleActive : s.micCircleIdle,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
              onPress={handleMicTap}
              accessibilityLabel="Microphone button"
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={38}
                color={colors.white}
              />
            </Pressable>
          </View>

          {/* Live Spoken Text Preview */}
          <View style={s.previewCard}>
            <Text style={s.previewLabel}>TRANSCRIPTION</Text>
            <Text
              style={[
                s.previewText,
                !spokenText && s.previewPlaceholder,
              ]}
              numberOfLines={2}
            >
              {spokenText ? `“${spokenText}”` : 'Listening for flower varieties, bouquets, or occasions…'}
            </Text>
          </View>

          {/* Quick Vocal Suggestions */}
          <View style={s.suggestionsSection}>
            <Text style={s.suggestionsTitle}>POPULAR SPOKEN INQUIRIES</Text>
            <View style={s.chipsWrap}>
              {VOICE_SUGGESTIONS.map((item) => (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    s.chip,
                    pressed && { backgroundColor: colors.surfaceVariant },
                  ]}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons name="mic" size={11} color={colors.primary} />
                  <Text style={s.chipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={s.bottomRow}>
            {spokenText.length > 0 && (
              <Pressable
                style={s.applyBtn}
                onPress={() => {
                  cancelSpeechRecognition();
                  onSelectQuery(spokenText);
                  onClose();
                }}
              >
                <Ionicons name="search" size={15} color={colors.white} />
                <Text style={s.applyBtnText}>Search "{spokenText}"</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 22,
    alignItems: 'center',
    ...(shadows?.card || {}),
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDeep,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusTextError: {
    color: colors.dealOrange || '#C2185B',
  },
  micWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(233, 30, 99, 0.22)',
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...(shadows?.card || {}),
  },
  micCircleActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  micCircleIdle: {
    backgroundColor: colors.primaryDeep,
  },
  previewCard: {
    width: '100%',
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginVertical: 14,
  },
  previewLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 20,
    minHeight: 22,
  },
  previewPlaceholder: {
    color: colors.muted,
    fontWeight: '500',
    fontSize: 12.5,
  },
  suggestionsSection: {
    width: '100%',
    marginTop: 6,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  bottomRow: {
    width: '100%',
    marginTop: 8,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 16,
    width: '100%',
  },
  applyBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
