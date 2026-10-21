import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { DhanvikkSpeechModule } = NativeModules;

export interface VoiceSearchListener {
  onStart?: () => void;
  onPartialResult?: (text: string) => void;
  onResult?: (text: string) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

let eventEmitter: NativeEventEmitter | null = null;
let currentSubscriptions: { remove: () => void }[] = [];

if (DhanvikkSpeechModule) {
  eventEmitter = new NativeEventEmitter(DhanvikkSpeechModule);
}

/**
 * Check if native speech recognition is available on the current device
 */
export async function isSpeechAvailable(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (!DhanvikkSpeechModule) return false;
    try {
      return await DhanvikkSpeechModule.isRecognitionAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check if Android Google Voice Search activity is available
 */
export async function isGoogleVoiceSearchAvailable(): Promise<boolean> {
  if (Platform.OS === 'android' && DhanvikkSpeechModule?.isGoogleVoiceSearchAvailable) {
    try {
      return await DhanvikkSpeechModule.isGoogleVoiceSearchAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Launch Android's native Google Voice Search intent dialog.
 * Opens the built-in Google Speech Recognition overlay.
 */
export async function triggerGoogleVoiceSearch(
  prompt: string = 'Speak to search flowers, bouquets, or occasions…'
): Promise<string> {
  if (Platform.OS !== 'android' || !DhanvikkSpeechModule?.startGoogleVoiceSearch) {
    throw new Error('Google Voice Search is only available on Android native builds');
  }

  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    throw new Error('Microphone permission was denied.');
  }

  return await DhanvikkSpeechModule.startGoogleVoiceSearch(prompt);
}

/**
 * Unified Voice Search launcher:
 * Directly triggers Google Voice Search activity overlay.
 * Falls back to in-app custom modal if Google Voice Search is cancelled, unsupported, or on iOS/web.
 */
export async function launchVoiceSearch(
  onRecognized: (recognizedText: string) => void,
  onFallback?: () => void,
  prompt?: string
): Promise<void> {
  if (Platform.OS === 'android' && DhanvikkSpeechModule?.startGoogleVoiceSearch) {
    try {
      const isAvailable = await isGoogleVoiceSearchAvailable();
      if (isAvailable) {
        const text = await triggerGoogleVoiceSearch(prompt);
        if (text && text.trim().length > 0) {
          onRecognized(text.trim());
          return;
        }
      }
    } catch (err: any) {
      // If user deliberately cancelled, do not force modal
      if (err?.code === 'CANCELLED' || err?.message?.includes('cancelled')) {
        return;
      }
      // If unavailable or errored, proceed to fallback modal
    }
  }

  // Fallback to in-app voice recognition modal
  if (onFallback) {
    onFallback();
  }
}

/**
 * Request microphone recording permission on Android
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission for Voice Search',
        message: 'Dhanvikk Blooms needs access to your microphone to transcribe your flower search requests.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Start listening for speech and transcribing to text
 */
export async function startSpeechRecognition(
  listener: VoiceSearchListener,
  language: string = 'en-IN'
): Promise<boolean> {
  if (Platform.OS !== 'android' || !DhanvikkSpeechModule || !eventEmitter) {
    if (listener.onError) {
      listener.onError('Speech recognition is not supported on this platform');
    }
    return false;
  }

  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    if (listener.onError) {
      listener.onError('Microphone permission was denied. Please allow microphone in app settings.');
    }
    return false;
  }

  // Clear any existing subscriptions
  cleanupVoiceSubscriptions();

  try {
    const subStart = eventEmitter.addListener('onSpeechStart', () => {
      listener.onStart?.();
    });

    const subPartial = eventEmitter.addListener('onSpeechPartialResults', (data: any) => {
      const text = data?.text || data?.results?.[0] || '';
      if (text) {
        listener.onPartialResult?.(text);
      }
    });

    const subResults = eventEmitter.addListener('onSpeechResults', (data: any) => {
      const text = data?.text || data?.results?.[0] || '';
      if (text) {
        listener.onResult?.(text);
      }
    });

    const subError = eventEmitter.addListener('onSpeechError', (data: any) => {
      const msg = data?.message || 'Speech recognition encountered an issue. Try again.';
      listener.onError?.(msg);
    });

    const subEnd = eventEmitter.addListener('onSpeechEnd', () => {
      listener.onEnd?.();
    });

    currentSubscriptions = [subStart, subPartial, subResults, subError, subEnd];

    await DhanvikkSpeechModule.startListening(language);
    return true;
  } catch (err: any) {
    cleanupVoiceSubscriptions();
    listener.onError?.(err?.message || 'Unable to start speech recognition');
    return false;
  }
}

/**
 * Stop active speech recognition
 */
export async function stopSpeechRecognition(): Promise<void> {
  if (Platform.OS === 'android' && DhanvikkSpeechModule) {
    try {
      await DhanvikkSpeechModule.stopListening();
    } catch {}
  }
}

/**
 * Cancel and abort active speech recognition
 */
export async function cancelSpeechRecognition(): Promise<void> {
  if (Platform.OS === 'android' && DhanvikkSpeechModule) {
    try {
      await DhanvikkSpeechModule.cancelListening();
    } catch {}
  }
  cleanupVoiceSubscriptions();
}

/**
 * Clean up native event listeners
 */
export function cleanupVoiceSubscriptions(): void {
  currentSubscriptions.forEach((sub) => {
    try {
      sub.remove();
    } catch {}
  });
  currentSubscriptions = [];
}
