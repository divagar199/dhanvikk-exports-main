import { apiClient, TOKEN_STORAGE_KEY, authStorage, setAuthTokenMemory } from './apiClient';
import { User, Address, Product } from '../types';
import { firebaseAuthService } from './firebaseAuthService';

export const authService = {
  /**
   * Email/Password Login via Firebase Auth
   */
  async login(email: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    try {
      const fbResult = await firebaseAuthService.signInWithEmail(email, password);
      if (fbResult.success && fbResult.user) {
        return {
          success: true,
          user: fbResult.user,
          token: fbResult.token,
        };
      }
    } catch (fbErr) {
      console.warn('Firebase login attempt notice, falling back to direct endpoint:', fbErr);
    }

    const response = await apiClient.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    if (token) {
      setAuthTokenMemory(token);
      await authStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (user) {
        await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
      }
    }
    return response.data;
  },

  /**
   * Email/Password Registration via Firebase Auth
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }): Promise<{ success: boolean; user: User; token: string }> {
    try {
      const fbResult = await firebaseAuthService.signUpWithEmail(
        data.email,
        data.password,
        data.name,
        data.phone
      );
      if (fbResult.success && fbResult.user) {
        return {
          success: true,
          user: fbResult.user,
          token: fbResult.token,
        };
      }
    } catch (fbErr) {
      console.warn('Firebase register attempt notice, falling back to direct endpoint:', fbErr);
    }

    const response = await apiClient.post('/api/auth/register', data);
    const { token, user } = response.data;
    if (token) {
      setAuthTokenMemory(token);
      await authStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (user) {
        await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
      }
    }
    return response.data;
  },

  /**
   * Google Sign-in via Firebase Auth
   */
  async googleLogin(data: {
    name?: string;
    email: string;
    avatar?: string;
    googleUid?: string;
    phone?: string;
  }): Promise<{ success: boolean; user: User; token: string }> {
    try {
      const fbResult = await firebaseAuthService.signInWithGoogle(data);
      if (fbResult.success && fbResult.user) {
        return {
          success: true,
          user: fbResult.user,
          token: fbResult.token,
        };
      }
    } catch (fbErr) {
      console.log('Firebase Google login attempt notice, falling back to direct endpoint:', fbErr);
    }

    const response = await apiClient.post('/api/auth/google', data);
    const { token, user } = response.data;
    if (token) {
      setAuthTokenMemory(token);
      await authStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (user) {
        await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
      }
    }
    return response.data;
  },

  /**
   * Direct Redirect to Google Login Page (accounts.google.com)
   */
  async redirectToGoogleLoginPage(providedEmail?: string): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    cancelled?: boolean;
    error?: string;
    requiresEmailConfirm?: boolean;
  }> {
    return firebaseAuthService.redirectToGoogleLoginPage(providedEmail);
  },


  async getMe(): Promise<{ success: boolean; user: User }> {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  async getProfileData(email?: string): Promise<{
    success: boolean;
    user?: User;
    savedAddresses: Address[];
    savedBouquets: any[];
    recentOrders: any[];
    cart?: any[];
  }> {
    const response = await apiClient.get('/api/auth/profile-data', {
      params: email ? { email } : undefined,
    });
    return response.data;
  },

  async saveAddress(
    address: Partial<Address> & { email?: string }
  ): Promise<{ success: boolean; message?: string; addresses: Address[] }> {
    const response = await apiClient.post('/api/auth/addresses', address);
    return response.data;
  },

  async deleteAddress(
    id: string,
    email?: string
  ): Promise<{ success: boolean; message?: string; addresses: Address[] }> {
    const response = await apiClient.delete(`/api/auth/addresses/${id}`, {
      params: email ? { email } : undefined,
    });
    return response.data;
  },

  async toggleWishlist(bouquet: Partial<Product>): Promise<{
    success: boolean;
    action: 'added' | 'removed';
    savedBouquets: any[];
  }> {
    const response = await apiClient.post('/api/auth/wishlist', { bouquet });
    return response.data;
  },

  async saveUserCart(cart: any[]): Promise<{ success: boolean; cart: any[] }> {
    const response = await apiClient.post('/api/auth/cart', { cart });
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await firebaseAuthService.signOut();
    } catch {}
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Continue client cleanup even if network fails
    }
    setAuthTokenMemory(null);
    await authStorage.deleteItem(TOKEN_STORAGE_KEY);
    await authStorage.deleteItem('dhanvikk_user');
  },
};

export default authService;
