import { create } from 'zustand';
import type { CartItem, User } from '@/types/models';
import { getProfileData, saveUserCart, toggleWishlist } from '@/services/auth';
import { getStorageItem, setStorageItem } from '@/lib/storage';

export const getUserKey = (u?: User | null): string => {
  if (!u) return 'guest';
  const raw = u.id || (u as any)._id || u.email || 'guest';
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'guest';
};

export const getWishlistStorageKey = (u?: User | null): string =>
  `dhanvikk.wishlist.${getUserKey(u)}`;

export const getCartStorageKey = (u?: User | null): string =>
  `dhanvikk.cart.${getUserKey(u)}`;

export const WISHLIST_STORAGE_KEY = 'dhanvikk.guest.wishlist';
export const CART_STORAGE_KEY = 'dhanvikk.guest.cart';

// Ghost bouquets that were previously injected by backend sample defaults
const GHOST_BOUQUET_IDS = new Set(['flw-rose-01', 'flw-rose-02', 'flw-rose-03', 'flw-rose-04']);

export const sanitizeWishlist = (list: any): string[] => {
  if (!Array.isArray(list)) return [];
  return Array.from(
    new Set(
      list
        .map((x) => String(x || '').trim())
        .filter((id) => id && !GHOST_BOUQUET_IDS.has(id))
    )
  );
};

export const loadStoredCart = async (u?: User | null): Promise<CartItem[]> => {
  const key = getCartStorageKey(u);
  let stored = await getStorageItem<CartItem[]>(key).catch(() => null);
  if ((!stored || !Array.isArray(stored) || stored.length === 0) && !u) {
    stored = await getStorageItem<CartItem[]>(CART_STORAGE_KEY).catch(() => null);
  }
  return Array.isArray(stored) ? stored.map((i) => sanitizeCartItem(i, i.quantity)) : [];
};

export const loadStoredWishlist = async (u?: User | null): Promise<string[]> => {
  const key = getWishlistStorageKey(u);
  let stored = await getStorageItem<string[]>(key).catch(() => null);
  if ((!stored || !Array.isArray(stored) || stored.length === 0) && !u) {
    stored = await getStorageItem<string[]>(WISHLIST_STORAGE_KEY).catch(() => null);
  }
  return sanitizeWishlist(stored);
};

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

export const parsePrice = (price: any): number => {
  if (typeof price === 'number') return isNaN(price) ? 999 : price;
  if (!price) return 999;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 999 : num;
};

export const sanitizeCartItem = (p: any, quantity: number = 1): CartItem => {
  const canonicalId = String(p.id || p._id || p.slug || `stem_${Date.now()}`);
  return {
    id: canonicalId,
    _id: canonicalId,
    slug: String(p.slug || canonicalId),
    name: String(p.name || 'Floral Arrangement'),
    category: typeof p.category === 'object' && p.category !== null ? String(p.category.name || 'Flowers') : String(p.category || 'Luxury Flowers'),
    flowerType: p.flowerType ? String(p.flowerType) : undefined,
    price: parsePrice(p.price),
    originalPrice: p.originalPrice ? parsePrice(p.originalPrice) : undefined,
    stock: p.stock !== undefined ? Number(p.stock) : 99,
    image: p.image || p.images?.[0] || '',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    quantity: Math.max(1, Number(quantity) || 1),
    description: typeof p.description === 'string' ? p.description.slice(0, 160) : '',
  };
};

export const matchesCartItem = (item: CartItem, targetId: string): boolean => {
  if (!targetId || !item) return false;
  const target = String(targetId).trim().toLowerCase();
  const cands = [item.id, item._id, item.slug]
    .filter(Boolean)
    .map((x) => String(x).trim().toLowerCase());
  return cands.includes(target);
};

// Helper to push cart to storage and backend without blocking UI
const pushCartToServer = (user: User | null, cart: CartItem[]) => {
  const cartKey = getCartStorageKey(user);
  setStorageItem(cartKey, cart).catch((err) => {
    console.warn('[useStore] Failed to save cart locally:', err);
  });
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
    const prevKey = getUserKey(get().user);
    const nextKey = getUserKey(user);

    set({ user });

    if (prevKey !== nextKey) {
      // Switched user or logged in/out:
      // Clear in-memory state immediately so previous user's cart/wishlist does not leak
      set({ cart: [], wishlist: [] });

      // Asynchronously load the new user's (or guest's) isolated cart and wishlist
      Promise.all([
        loadStoredCart(user),
        loadStoredWishlist(user),
      ])
        .then(([userCart, userWishlist]) => {
          // If the user changed again while loading, abort setting
          if (getUserKey(get().user) !== nextKey) return;

          set({
            cart: userCart,
            wishlist: userWishlist,
          });

          if (user) {
            get().syncWithServer();
          }
        })
        .catch(() => {
          if (user) {
            get().syncWithServer();
          }
        });
    } else if (user) {
      get().syncWithServer();
    }
  },

  setCart: (cart) => {
    const cleanCart = cart.map((i) => sanitizeCartItem(i, i.quantity));
    set({ cart: cleanCart });
    pushCartToServer(get().user, cleanCart);
  },

  setWishlist: (rawWishlist) => {
    const wishlist = sanitizeWishlist(rawWishlist);
    set({ wishlist });
    setStorageItem(getWishlistStorageKey(get().user), wishlist).catch(() => {});
  },

  add: (p) => {
    const s = get();
    const targetId = String(p.id || p._id || p.slug || '');
    const existing = s.cart.find((i) => matchesCartItem(i, targetId));
    const addQty = p.quantity && p.quantity > 0 ? Number(p.quantity) : 1;
    const nextCart = existing
      ? s.cart.map((i) =>
          matchesCartItem(i, targetId)
            ? { ...i, quantity: (Number(i.quantity) || 1) + addQty }
            : i
        )
      : [...s.cart, sanitizeCartItem(p, addQty)];

    set({ cart: nextCart });
    pushCartToServer(s.user, nextCart);
  },

  remove: (id) => {
    const s = get();
    const nextCart = s.cart.filter((i) => !matchesCartItem(i, id));
    set({ cart: nextCart });
    pushCartToServer(s.user, nextCart);
  },

  qty: (id, n) => {
    const s = get();
    const num = Number(n);
    const nextCart =
      num < 1
        ? s.cart.filter((i) => !matchesCartItem(i, id))
        : s.cart.map((i) =>
            matchesCartItem(i, id) ? { ...i, quantity: num } : i
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
    const idStr = String(id || '').trim();
    if (!idStr) return;

    const allKeys = [idStr, ...(bouquet?.altIds?.map(String) || [])].filter(Boolean);
    const isSaved = s.wishlist.some((x) => allKeys.includes(String(x)));

    const nextWishlist = sanitizeWishlist(
      isSaved
        ? s.wishlist.filter((x) => !allKeys.includes(String(x)))
        : [...s.wishlist, idStr]
    );

    set({ wishlist: nextWishlist });
    setStorageItem(getWishlistStorageKey(s.user), nextWishlist).catch(() => {});

    if (s.user) {
      toggleWishlist({
        id: idStr,
        name: bouquet?.name || 'Floral Arrangement',
        price: parsePrice(bouquet?.price),
        image: bouquet?.image || '',
      }).catch((err) => {
        console.warn('[useStore] Failed to toggle wishlist on server:', err?.message || err);
      });
    }
  },

  syncWithServer: async () => {
    const s = get();
    if (!s.user) return;
    const syncUserKey = getUserKey(s.user);
    try {
      set({ isSyncing: true });
      const data = await getProfileData();
      if (getUserKey(get().user) !== syncUserKey) {
        set({ isSyncing: false });
        return;
      }
      if (data) {
        // Merge server cart with live cart
        const currentLiveCart = get().cart;
        const serverCart: CartItem[] = Array.isArray(data.cart) ? data.cart : [];
        const mergedCartMap = new Map<string, CartItem>();

        for (const item of serverCart) {
          const clean = sanitizeCartItem(item, item.quantity);
          const itemId = String(clean.id || clean.slug || 'item');
          mergedCartMap.set(itemId, clean);
        }

        for (const localItem of currentLiveCart) {
          const clean = sanitizeCartItem(localItem, localItem.quantity);
          const itemId = String(clean.id || clean.slug || 'item');
          const existing = mergedCartMap.get(itemId);
          if (existing) {
            mergedCartMap.set(itemId, {
              ...existing,
              quantity: Math.max(existing.quantity || 1, clean.quantity || 1),
            });
          } else {
            mergedCartMap.set(itemId, clean);
          }
        }

        const mergedCart = Array.from(mergedCartMap.values());

        // Wishlist
        const serverWishlistIds: string[] = Array.isArray(data.savedBouquets)
          ? data.savedBouquets.map((b: any) => String(b.id || b._id || b.slug)).filter(Boolean)
          : [];
        const mergedWishlist = sanitizeWishlist([...get().wishlist, ...serverWishlistIds]);

        set({
          cart: mergedCart,
          wishlist: mergedWishlist,
          isSyncing: false,
        });

        // Persist locally for this user
        setStorageItem(getCartStorageKey(s.user), mergedCart).catch(() => {});
        setStorageItem(getWishlistStorageKey(s.user), mergedWishlist).catch(() => {});

        // Push merged cart back to server to ensure 100% synchronization
        if (mergedCart.length > 0) {
          saveUserCart(mergedCart).catch(() => {});
        }
      } else {
        set({ isSyncing: false });
      }
    } catch (e: any) {
      console.warn('[useStore] syncWithServer error:', e?.message || e);
      set({ isSyncing: false });
    }
  },
}));

export const cartTotal = (c: CartItem[]) =>
  c.reduce((n, x) => n + parsePrice(x.price) * Math.max(1, Number(x.quantity) || 1), 0);

// Hydrate guest storage asynchronously on app initialization
loadStoredWishlist(null)
  .then((stored) => {
    if (getUserKey(useStore.getState().user) === 'guest') {
      const current = useStore.getState().wishlist;
      if (current.length === 0 && stored.length > 0) {
        useStore.setState({ wishlist: stored });
      }
    }
  })
  .catch(() => {});

loadStoredCart(null)
  .then((stored) => {
    if (getUserKey(useStore.getState().user) === 'guest') {
      const current = useStore.getState().cart;
      if (current.length === 0 && stored.length > 0) {
        useStore.setState({ cart: stored });
      }
    }
  })
  .catch(() => {});