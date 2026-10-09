import { create } from 'zustand';
import { User } from '../types';
import { TOKEN_STORAGE_KEY, authStorage, setAuthTokenMemory } from '../services/apiClient';
import { authService } from '../services/authService';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  savedAddresses: any[];
  recentOrders: any[];
  savedAccounts: { email: string; name: string }[];
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setSavedAddresses: (addresses: any[]) => void;
  setRecentOrders: (orders: any[]) => void;
  addSavedAccount: (email: string, name?: string) => Promise<void>;
  syncUserData: (email?: string) => Promise<void>;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const DEFAULT_GUEST_USER: User = {
  id: 'guest_user_dhanvikk',
  name: 'Guest Customer',
  email: 'guest@dhanvikk.com',
  role: 'customer',
  phone: '+971 50 000 0000',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_GUEST_USER,
  token: 'guest_token',
  isLoading: false,
  isInitialized: true,
  savedAddresses: [],
  recentOrders: [],
  savedAccounts: [],

  setAuth: (user: User, token: string) => {
    setAuthTokenMemory(token);
    authStorage.setItem(TOKEN_STORAGE_KEY, token).catch(() => {});
    authStorage.setItem('dhanvikk_user', JSON.stringify(user)).catch(() => {});
    set({ user, token, isInitialized: true });
    // Record account in persistent saved accounts list
    get().addSavedAccount(user.email, user.name);
    // Synchronize full user profile, addresses, orders & saved items in real time
    get().syncUserData(user.email);
  },

  setUser: (user: User) => {
    set({ user });
    authStorage.setItem('dhanvikk_user', JSON.stringify(user)).catch(() => {});
  },

  setSavedAddresses: (savedAddresses: any[]) => {
    set({ savedAddresses });
    authStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(savedAddresses)).catch(() => {});
  },

  setRecentOrders: (recentOrders: any[]) => {
    set({ recentOrders });
    authStorage.setItem('dhanvikk_recent_orders', JSON.stringify(recentOrders)).catch(() => {});
  },

  addSavedAccount: async (email: string, name?: string) => {
    if (!email) return;
    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanName = name?.trim() || cleanEmail.split('@')[0];
      const raw = await authStorage.getItem('dhanvikk_saved_accounts');
      let accounts: { email: string; name: string }[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(accounts)) accounts = [];
      const filtered = accounts.filter((a) => a.email.toLowerCase() !== cleanEmail);
      filtered.unshift({ email: cleanEmail, name: cleanName });
      const updated = filtered.slice(0, 8); // Keep top 8 accounts
      await authStorage.setItem('dhanvikk_saved_accounts', JSON.stringify(updated));
      set({ savedAccounts: updated });
    } catch {}
  },

  syncUserData: async (email?: string) => {
    const targetEmail = email || get().user?.email;
    if (!targetEmail) return;
    try {
      const data = await authService.getProfileData(targetEmail);
      if (data?.success) {
        // 1. Sync User info
        if (data.user) {
          const currentUser = get().user;
          const mergedUser: User = {
            ...(currentUser || {}),
            ...data.user,
            id: (data.user.id || (data.user as any)._id || currentUser?.id) as string,
          };
          set({ user: mergedUser });
          await authStorage.setItem('dhanvikk_user', JSON.stringify(mergedUser)).catch(() => {});
        }

        // 2. Sync Saved Addresses
        if (Array.isArray(data.savedAddresses) && data.savedAddresses.length > 0) {
          set({ savedAddresses: data.savedAddresses });
          await authStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(data.savedAddresses)).catch(() => {});
        }

        // 3. Sync Recent Orders
        if (Array.isArray(data.recentOrders) && data.recentOrders.length > 0) {
          set({ recentOrders: data.recentOrders });
          await authStorage.setItem('dhanvikk_recent_orders', JSON.stringify(data.recentOrders)).catch(() => {});
        }

        // 4. Sync Wishlist
        if (Array.isArray(data.savedBouquets) && data.savedBouquets.length > 0) {
          useWishlistStore.getState().setWishlist(data.savedBouquets);
        }

        // 5. Sync Cart
        if (Array.isArray(data.cart) && data.cart.length > 0) {
          const currentItems = useCartStore.getState().items;
          if (currentItems.length === 0) {
            useCartStore.getState().setCartItems(data.cart);
          }
        }
      }
    } catch {
      // Non-blocking sync
    }
  },

  initAuth: async () => {
    try {
      set({ isLoading: true });
      let savedToken = await authStorage.getItem(TOKEN_STORAGE_KEY);

      // Instantly restore cached addresses, orders & accounts from storage
      const [cachedAddrs, cachedOrders, cachedAccounts] = await Promise.all([
        authStorage.getItem('dhanvikk_saved_addresses'),
        authStorage.getItem('dhanvikk_recent_orders'),
        authStorage.getItem('dhanvikk_saved_accounts'),
      ]);

      if (cachedAddrs) {
        try { set({ savedAddresses: JSON.parse(cachedAddrs) }); } catch {}
      }
      if (cachedOrders) {
        try { set({ recentOrders: JSON.parse(cachedOrders) }); } catch {}
      }
      if (cachedAccounts) {
        try { set({ savedAccounts: JSON.parse(cachedAccounts) }); } catch {}
      }

      if (savedToken) {
        setAuthTokenMemory(savedToken);
        try {
          const { user } = await authService.getMe();
          set({ user, token: savedToken, isInitialized: true, isLoading: false });
          get().syncUserData(user.email);
          return;
        } catch {
          // If offline or dormant backend waking up, restore cached user
          const cachedUserStr = await authStorage.getItem('dhanvikk_user');
          if (cachedUserStr) {
            try {
              const cachedUser = JSON.parse(cachedUserStr);
              set({ user: cachedUser, token: savedToken, isInitialized: true, isLoading: false });
              get().syncUserData(cachedUser.email);
              return;
            } catch {}
          }
        }
      }
    } catch {
      setAuthTokenMemory(null);
      await authStorage.deleteItem(TOKEN_STORAGE_KEY).catch(() => {});
      await authStorage.deleteItem('dhanvikk_user').catch(() => {});
    }
    set({ user: DEFAULT_GUEST_USER, token: 'guest_token', isInitialized: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Continue cleanup
    }
    useWishlistStore.getState().clearWishlist();
    set({ user: DEFAULT_GUEST_USER, token: 'guest_token', savedAddresses: [], recentOrders: [] });
  },
}));

export default useAuthStore;
