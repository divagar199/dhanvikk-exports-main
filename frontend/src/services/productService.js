import api from './api';
import { PRODUCTS } from '../data/products';

export const productService = {
  /**
   * Fetch all products from MongoDB API with fallback
   */
  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/api/products', { params });
      if (response.data && response.data.products && response.data.products.length > 0) {
        return response.data.products;
      }
      return PRODUCTS;
    } catch (err) {
      console.warn('Backend product fetch error, fallback to local dataset:', err.message);
      return PRODUCTS;
    }
  },

  /**
   * Fetch single product by id or slug
   */
  async getProductByIdOrSlug(idOrSlug) {
    try {
      const response = await api.get(`/api/products/${idOrSlug}`);
      if (response.data && response.data.product) {
        return response.data.product;
      }
    } catch {
      // fallback search
    }
    return PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || PRODUCTS[0];
  },

  /**
   * Admin: Create new product
   */
  async createProduct(productData) {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  /**
   * Admin: Update product
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  /**
   * Admin: Delete product
   */
  async deleteProduct(id) {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Admin: Update live stock level
   */
  async updateStockLevel(id, stock) {
    const response = await api.patch(`/api/products/${id}/stock`, { stock });
    return response.data;
  },

  /**
   * Admin: Upload product image file and store locally
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/api/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Admin: Get all locally stored images in code
   */
  async getLocalImages() {
    try {
      const response = await api.get('/api/products/local-images');
      return response.data;
    } catch {
      return { success: true, images: [] };
    }
  },
};

