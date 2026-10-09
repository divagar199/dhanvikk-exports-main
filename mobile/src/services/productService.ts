import { apiClient } from './apiClient';
import { Product, ProductFilters } from '../types';

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<{ success: boolean; count: number; products: Product[] }> {
    const params: Record<string, any> = {};
    let clientFilterCategory = '';
    let clientFilterFlowerType = '';
    let clientFilterSubCategory = '';

    if (filters) {
      if (filters.category && filters.category !== 'All' && filters.category !== 'All Blooms') {
        const cat = filters.category.trim();
        const lowerCat = cat.toLowerCase();

        // Check if matching primary DB categories
        if (['flowers', 'flower boxes', 'forever roses', 'plants'].includes(lowerCat)) {
          params.category = cat;
          clientFilterCategory = lowerCat;
        } else if (['roses', 'lilies', 'orchids', 'tulips', 'sunflowers', 'mixed'].includes(lowerCat)) {
          params.flowerType = cat;
          clientFilterFlowerType = lowerCat;
        } else if (lowerCat.includes('bouquet')) {
          clientFilterSubCategory = 'hand bouquets';
        } else if (lowerCat.includes('box') || lowerCat.includes('hamper') || lowerCat.includes('bundle')) {
          clientFilterCategory = 'flower boxes';
        } else {
          params.search = cat;
        }
      }

      if (filters.occasion && filters.occasion !== 'All') {
        params.occasion = filters.occasion;
      }
      if (filters.recipient && filters.recipient !== 'Everyone') {
        params.recipient = filters.recipient;
      }
      if (filters.flowerType && filters.flowerType !== 'All') {
        params.flowerType = filters.flowerType;
        clientFilterFlowerType = filters.flowerType.toLowerCase();
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.sort) {
        params.sort = filters.sort;
      }
      if (filters.tag) {
        params.tag = filters.tag;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }
    }

    let response;
    try {
      response = await apiClient.get('/api/products', { params });
    } catch {
      response = await apiClient.get('/api/products');
    }

    let products: Product[] = response.data?.products || [];

    // Fallback: If filtered API request yielded 0 but client filters exist, fetch all and filter client-side
    if (products.length === 0 && (clientFilterSubCategory || clientFilterCategory || clientFilterFlowerType)) {
      try {
        const allRes = await apiClient.get('/api/products');
        products = allRes.data?.products || [];
      } catch {
        // keep empty
      }
    }

    // Apply resilient client-side filters
    if (clientFilterSubCategory) {
      products = products.filter(
        (p) =>
          p.subCategory?.toLowerCase().includes(clientFilterSubCategory) ||
          p.name?.toLowerCase().includes('bouquet') ||
          p.category?.toLowerCase() === 'flowers'
      );
    }
    if (clientFilterCategory) {
      const filtered = products.filter(
        (p) => p.category?.toLowerCase() === clientFilterCategory
      );
      if (filtered.length > 0) products = filtered;
    }
    if (clientFilterFlowerType) {
      const filtered = products.filter(
        (p) =>
          p.flowerType?.toLowerCase() === clientFilterFlowerType ||
          p.name?.toLowerCase().includes(clientFilterFlowerType)
      );
      if (filtered.length > 0) products = filtered;
    }

    // Client-side sorting fallback
    if (filters?.sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return {
      success: true,
      count: products.length,
      products,
    };
  },

  async getProductById(identifier: string): Promise<{ success: boolean; product: Product }> {
    const response = await apiClient.get(`/api/products/${identifier}`);
    return response.data;
  },
};

export default productService;
