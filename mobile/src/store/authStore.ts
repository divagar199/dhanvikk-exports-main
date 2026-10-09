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
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  syncUserData: (email?: string) => Promise<void>;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  setAuth: (user: User, token: string) => {
    setAuthTokenMemory(token);
    authStorage.setItem(TOKEN_STORAGE_KEY, token).catch(() => {});
    authStorage.setItem('dhanvikk_user', JSON.stringify(user)).catch(() => {});
    set({ user, token, isInitialized: true });
    // Synchronize user profile & saved data from backend
    get().syncUserData(user.email);
  },

  setUser: (user: User) => {
    set({ user });
    authStorage.setItem('dhanvikk_user', JSON.stringify(user)).catch(() => {});
  },

  syncUserData: async (email?: string) => {
    const targetEmail = email || get().user?.email;
    if (!targetEmail) return;
    try {
      const data = await authService.getProfileData(targetEmail);
      if (data?.success) {
        if (data.user) {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                ...data.user,
                id: (data.user.id || data.user._id || currentUser.id) as string,
              },
            });
          }
        }
        if (Array.isArray(data.savedBouquets) && data.savedBouquets.length > 0) {
          useWishlistStore.getState().setWishlist(data.savedBouquets);
        }
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
    set({ user: null, token: null, isInitialized: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Continue cleanup
    }
    useWishlistStore.getState().clearWishlist();
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
