import api from './api';

export const authService = {
  /**
   * Log in customer or staff with email and password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, message: string, user: object, token: string }>}
   */
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new customer
   * @param {{ name: string, email: string, password: string, phone?: string }} userData
   */
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Continue with Google OAuth flow (Firebase)
   */
  async loginWithGoogle(payload = {}) {
    const response = await api.post('/api/auth/google', payload);
    return response.data;
  },

  /**
   * Retrieve active session user
   */
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Log out active user and clear session cookies
   */
  async logout() {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Retrieve full profile data including saved addresses, bouquets & orders
   */
  async getProfileData(email = '') {
    const response = await api.get('/api/auth/profile-data', {
      params: email ? { email } : {},
      headers: email ? { 'x-user-email': email } : {},
    });
    return response.data;
  },

  /**
   * Update name, phone, or avatar
   */
  async updateProfile(profileData) {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  /**
   * Add or edit saved delivery address
   */
  async saveAddress(addressData) {
    const response = await api.post('/api/auth/addresses', addressData);
    return response.data;
  },

  /**
   * Delete saved delivery address
   */
  async deleteAddress(addressId) {
    const response = await api.delete(`/api/auth/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Toggle saved bouquet in wishlist
   */
  async toggleWishlist(bouquet) {
    const response = await api.post('/api/auth/wishlist', { bouquet });
    return response.data;
  },

  /**
   * Verify unique encrypted portal key
   */
  async verifyPortalKey(portalKey) {
    const response = await api.post('/api/auth/verify-portal', { portalKey });
    return response.data;
  },

  /**
   * Persist user-specific cart
   */
  async saveUserCart(cart) {
    const response = await api.post('/api/auth/cart', { cart });
    return response.data;
  },
};
