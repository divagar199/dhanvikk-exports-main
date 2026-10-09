import { create } from 'zustand';
import { Product } from '../types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { authService } from '../services/authService';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  setWishlist: (items: Product[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  toggleWishlist: (product: Product) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    set((state) => {
      const prodId = product.id || product._id;
      const exists = state.items.some((item) => (item.id || item._id) === prodId);

      if (exists) {
        return {
          items: state.items.filter((item) => (item.id || item._id) !== prodId),
        };
      }
      return {
        items: [...state.items, product],
      };
    });

    // 2-way sync with backend & website
    authService.toggleWishlist(product).catch(() => {});
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => (item.id || item._id) === productId);
  },

  setWishlist: (items: Product[]) => set({ items }),

  clearWishlist: () => set({ items: [] }),
}));

export default useWishlistStore;
