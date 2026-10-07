import api from './api';
import { getProductImageUrl, getBackendApiImageUrl } from '../utils/imageUrl';

/**
 * Service to fetch images and image metadata from backend API
 */
export const imageService = {
  /**
   * Fetch all images stored on the backend with optional category & search filter
   * @param {Object} params - { category?: string, search?: string }
   */
  async getImages(params = {}) {
    try {
      const response = await api.get('/api/images', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get images from backend API:', error);
      return { success: false, count: 0, images: [] };
    }
  },

  /**
   * Fetch image category counts from backend API
   */
  async getCategories() {
    try {
      const response = await api.get('/api/images/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to get categories from backend API:', error);
      return { success: false, categories: {} };
    }
  },

  /**
   * Get direct API stream URL for an image
   * @param {string} relativePath - e.g. "/images/products/rose.webp"
   */
  getApiUrl(relativePath) {
    return getBackendApiImageUrl(relativePath);
  },

  /**
   * Get static or API URL for an image
   * @param {string} path
   */
  getUrl(path) {
    return getProductImageUrl(path);
  },
};

export default imageService;
