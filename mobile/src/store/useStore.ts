import { create } from 'zustand';
import type { CartItem, User } from '@/types/models';
import { getProfileData, saveUserCart, toggleWishlist } from '@/services/auth';
import { getStorageItem, setStorageItem } from '@/lib/storage';

const WISHLIST_STORAGE_KEY = 'dhanvikk.guest.wishlist';
const CART_STORAGE_KEY = 'dhanvikk.guest.cart';

type WishBouquetPayload = {
  name?: string;
  price?: number;
  image?: string;
  altIds?: string[];
};

type StoreState = {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  isSyncing: boolean;
  setUser: (u: User | null) => void;
  setCart: (c: CartItem[]) => void;
  setWishlist: (w: string[]) => void;
  add: (p: CartItem) => void;
  remove: (id: string) => void;
  qty: (id: string, n: number) => void;
  clear: () => void;
  wish: (id: string, bouquet?: WishBouquetPayload) => void;
  syncWithServer: () => Promise<void>;
};

// Helper to push cart to backend without blocking UI
const pushCartToServer = (user: User | null, cart: CartItem[]) => {
  setStorageItem(CART_STORAGE_KEY, cart).catch(() => {});
  if (user) {
    saveUserCart(cart).catch((err) => {
      console.warn('[useStore] Failed to sync cart to server:', err?.message || err);
    });
  }
};

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  cart: [],
  wishlist: [],
  isSyncing: false,

  setUser: (user) => {
    set({ user });
    if (user) {
      get().syncWithServer();
    }
  },

  setCart: (cart) => {
    set({ cart });
    pushCartToServer(get().user, cart);
  },

  setWishlist: (wishlist) => {
    set({ wishlist });
    setStorageItem(WISHLIST_STORAGE_KEY, wishlist).catch(() => {});
  },

  add: (p) => {
    const s = get();
    const id = p.id || p._id || p.slug;
    const existing = s.cart.find((i) => (i.id || i._id || i.slug) === id);
    const addQty = p.quantity && p.quantity > 0 ? p.quantity : 1;
    const nextCart = existing
      ? s.cart.map((i) =>
          (i.id || i._id || i.slug) === id
            ? { ...i, quantity: (i.quantity || 1) + addQty }
            : i
        )
      : [...s.cart, { ...p, quantity: addQty }];

    set({ cart: nextCart });
    pushCartToServer(s.user, nextCart);
  },

  remove: (id) => {
    const s = get();
    const nextCart = s.cart.filter((i) => (i.id || i._id || i.slug) !== id);
    set({ cart: nextCart });
    pushCartToServer(s.user, nextCart);
  },

  qty: (id, n) => {
    const s = get();
    const nextCart =
      n < 1
        ? s.cart.filter((i) => (i.id || i._id || i.slug) !== id)
        : s.cart.map((i) =>
            (i.id || i._id || i.slug) === id ? { ...i, quantity: n } : i
          );
    set({ cart: nextCart });
    pushCartToServer(s.user, nextCart);
  },

  clear: () => {
    const s = get();
    set({ cart: [] });
    pushCartToServer(s.user, []);
  },

  wish: (id, bouquet) => {
    const s = get();
    const idStr = String(id || '');
    if (!idStr) return;

    const allKeys = [idStr, ...(bouquet?.altIds?.map(String) || [])].filter(Boolean);
    const isSaved = s.wishlist.some((x) => allKeys.includes(String(x)));

    const nextWishlist = isSaved
      ? s.wishlist.filter((x) => !allKeys.includes(String(x)))
      : [...s.wishlist, idStr];

    set({ wishlist: nextWishlist });
    setStorageItem(WISHLIST_STORAGE_KEY, nextWishlist).catch(() => {});

    if (s.user) {
      toggleWishlist({
        id: idStr,
        name: bouquet?.name || 'Floral Arrangement',
        price: bouquet?.price || 999,
        image: bouquet?.image || '',
      }).catch((err) => {
        console.warn('[useStore] Failed to toggle wishlist on server:', err?.message || err);
      });
    }
  },

  syncWithServer: async () => {
    const s = get();
    if (!s.user) return;
    try {
      set({ isSyncing: true });
      const data = await getProfileData();
      if (data) {
        // Merge server cart with local guest cart
        const serverCart: CartItem[] = Array.isArray(data.cart) ? data.cart : [];
        const localCart = s.cart;
        const mergedCartMap = new Map<string, CartItem>();

        // First add server cart items
        for (const item of serverCart) {
          const key = item.id || item._id || item.slug;
          if (key) mergedCartMap.set(key, item);
        }

        // Merge local items
        for (const localItem of localCart) {
          const key = localItem.id || localItem._id || localItem.slug;
          if (key) {
            const existing = mergedCartMap.get(key);
            if (existing) {
              mergedCartMap.set(key, {
                ...existing,
                quantity: Math.max(existing.quantity || 1, localItem.quantity || 1),
              });
            } else {
              mergedCartMap.set(key, localItem);
            }
          }
        }

        const mergedCart = Array.from(mergedCartMap.values());

        // Wishlist
        const serverWishlistIds: string[] = Array.isArray(data.savedBouquets)
          ? data.savedBouquets.map((b: any) => b.id || b._id || b.slug).filter(Boolean)
          : [];
        const mergedWishlist = Array.from(new Set([...s.wishlist, ...serverWishlistIds]));

        set({
          cart: mergedCart,
          wishlist: mergedWishlist,
          isSyncing: false,
        });

        // Push merged cart back to server to ensure 100% synchronization
        if (mergedCart.length > 0) {
          saveUserCart(mergedCart).catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn('[useStore] syncWithServer error:', e?.message || e);
      set({ isSyncing: false });
    }
  },
}));

export const cartTotal = (c: CartItem[]) =>
  c.reduce((n, x) => n + (x.price || 0) * (x.quantity || 1), 0);

// Hydrate guest storage asynchronously on app initialization
getStorageItem<string[]>(WISHLIST_STORAGE_KEY)
  .then((stored) => {
    if (Array.isArray(stored) && stored.length > 0) {
      const current = useStore.getState().wishlist;
      if (current.length === 0) {
        useStore.setState({ wishlist: stored });
      }
    }
  })
  .catch(() => {});

getStorageItem<CartItem[]>(CART_STORAGE_KEY)
  .then((stored) => {
    if (Array.isArray(stored) && stored.length > 0) {
      const current = useStore.getState().cart;
      if (current.length === 0) {
        useStore.setState({ cart: stored });
      }
    }
  })
  .catch(() => {});