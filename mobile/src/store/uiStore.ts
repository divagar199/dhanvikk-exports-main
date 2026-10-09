import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  toast: ToastState | null;
  deliveryLocation: string;
  hasCompletedOnboarding: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setDeliveryLocation: (location: string) => void;
  setOnboardingCompleted: () => void;
}

// Toast timeout handle kept outside store state to prevent re-renders
let _toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  deliveryLocation: 'Chennai 600001',
  hasCompletedOnboarding: true,

  showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Clear any existing auto-dismiss timer
    if (_toastTimeout) {
      clearTimeout(_toastTimeout);
      _toastTimeout = null;
    }
    set({ toast: { visible: true, message, type } });
    _toastTimeout = setTimeout(() => {
      set({ toast: null });
      _toastTimeout = null;
    }, 3000);
  },

  hideToast: () => {
    if (_toastTimeout) {
      clearTimeout(_toastTimeout);
      _toastTimeout = null;
    }
    set({ toast: null });
  },

  setDeliveryLocation: (location: string) => set({ deliveryLocation: location }),

  setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),
}));

export default useUIStore;
