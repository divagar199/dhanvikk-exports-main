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

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  deliveryLocation: 'Dubai, UAE',
  hasCompletedOnboarding: true,

  showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    set({ toast: { visible: true, message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  hideToast: () => set({ toast: null }),

  setDeliveryLocation: (location: string) => set({ deliveryLocation: location }),

  setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),
}));

export default useUIStore;
