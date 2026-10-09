import { create } from 'zustand';
import { Product, CartItem } from '../types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface CartState {
  items: CartItem[];
  deliveryDate: string;
  timeSlot: string;
  greetingCardMessage: string;
  addToCart: (
    product: Product,
    quantity?: number,
    deliveryDate?: string,
    timeSlot?: string,
    greetingCardMessage?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  setDeliveryDate: (date: string) => void;
  setTimeSlot: (slot: string) => void;
  setGreetingCardMessage: (msg: string) => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  deliveryDate: 'Today',
  timeSlot: 'Evening (5 PM - 9 PM)',
  greetingCardMessage: '',

  addToCart: (product, quantity = 1, deliveryDate, timeSlot, greetingCardMessage) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    set((state) => {
      const prodId = product.id || product._id;
      const existingIndex = state.items.findIndex(
        (item) => (item.product.id || item.product._id) === prodId
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        const existing = updatedItems[existingIndex];
        updatedItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
          deliveryDate: deliveryDate || existing.deliveryDate,
          timeSlot: timeSlot || existing.timeSlot,
          greetingCardMessage:
            greetingCardMessage !== undefined
              ? greetingCardMessage
              : existing.greetingCardMessage,
        };
        return { items: updatedItems };
      }

      return {
        items: [
          ...state.items,
          {
            product,
            quantity,
            deliveryDate: deliveryDate || state.deliveryDate,
            timeSlot: timeSlot || state.timeSlot,
            greetingCardMessage: greetingCardMessage !== undefined ? greetingCardMessage : state.greetingCardMessage,
          },
        ],
      };
    });
  },

  removeFromCart: (productId) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    set((state) => ({
      items: state.items.filter((item) => (item.product.id || item.product._id) !== productId),
    }));
  },

  updateQuantity: (productId, delta) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    set((state) => {
      const updated = state.items
        .map((item) => {
          if ((item.product.id || item.product._id) === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { items: updated };
    });
  },

  clearCart: () => {
    set({ items: [], greetingCardMessage: '' });
  },

  setCartItems: (items: CartItem[]) => {
    set({ items: Array.isArray(items) ? items : [] });
  },

  setDeliveryDate: (date: string) => set({ deliveryDate: date }),
  setTimeSlot: (slot: string) => set({ timeSlot: slot }),
  setGreetingCardMessage: (msg: string) => set({ greetingCardMessage: msg }),
  isInCart: (productId: string) => {
    if (!productId) return false;
    return get().items.some(
      (item) => (item.product.id || item.product._id) === productId
    );
  },

  getItemQuantity: (productId: string) => {
    if (!productId) return 0;
    const found = get().items.find(
      (item) => (item.product.id || item.product._id) === productId
    );
    return found ? found.quantity : 0;
  },

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    // Complimentary delivery over 2000 INR
    if (subtotal === 0 || subtotal >= 2000) return 0;
    return 149;
  },

  getTotalAmount: () => {
    return get().getSubtotal() + get().getDeliveryFee();
  },
}));

export default useCartStore;
