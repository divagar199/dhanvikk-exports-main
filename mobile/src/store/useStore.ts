 import { create } from 'zustand';
import type { CartItem, User } from '@/types/models';

type StoreState = {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  setUser: (u: User | null) => void;
  add: (p: CartItem) => void;
  remove: (id: string) => void;
  qty: (id: string, n: number) => void;
  clear: () => void;
  wish: (id: string) => void;
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  cart: [],
  wishlist: [],
  setUser: (user) => set({ user }),
  add: (p) =>
    set((s) => {
      const id = p.id || p._id || p.slug;
      const existing = s.cart.find((i) => (i.id || i._id || i.slug) === id);
      const addQty = p.quantity && p.quantity > 0 ? p.quantity : 1;
      return existing
        ? {
            cart: s.cart.map((i) =>
              (i.id || i._id || i.slug) === id
                ? { ...i, quantity: (i.quantity || 1) + addQty }
                : i
            ),
          }
        : { cart: [...s.cart, { ...p, quantity: addQty }] };
    }),
  remove: (id) =>
    set((s) => ({
      cart: s.cart.filter((i) => (i.id || i._id || i.slug) !== id),
    })),
  qty: (id, n) =>
    set((s) => ({
      cart:
        n < 1
          ? s.cart.filter((i) => (i.id || i._id || i.slug) !== id)
          : s.cart.map((i) =>
              (i.id || i._id || i.slug) === id ? { ...i, quantity: n } : i
            ),
    })),
  clear: () => set({ cart: [] }),
  wish: (id) =>
    set((s) => ({
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((x) => x !== id)
        : [...s.wishlist, id],
    })),
}));

export const cartTotal = (c: CartItem[]) =>
  c.reduce((n, x) => n + (x.price || 0) * (x.quantity || 1), 0);