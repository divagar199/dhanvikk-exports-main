import api from './api';
import { PRODUCTS } from '../data/products';

const LOCAL_STORAGE_KEY = 'dhanvikk_admin_products';

/**
 * Retrieve cached or custom products from localStorage
 */
function getStoredProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read products from localStorage:', err);
  }
  return null;
}

/**
 * Persist products to localStorage
 */
function saveStoredProducts(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Could not save products to localStorage (quota or disabled):', err);
  }
}

export const productService = {
  /**
   * Fetch all products from MongoDB API with resilient localStorage fallback
   */
  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/api/products', { params });
      if (response.data && response.data.products && response.data.products.length > 0) {
        const backendList = response.data.products.map((p) => {
          if (p.id === 'flw-036' || p.id === 'flw-105') {
            return { ...p, category: 'Flowers', subCategory: 'Hand Bouquets' };
          }
          return p;
        });
        const existingIds = new Set(backendList.map((p) => p.id || p._id));
        const missingBaseline = PRODUCTS.filter((p) => !existingIds.has(p.id));
        const combined = missingBaseline.length > 0 ? [...backendList, ...missingBaseline] : backendList;
        saveStoredProducts(combined);
        return combined;
      }
    } catch (err) {
      console.warn('Backend product fetch unavailable, falling back to local storage:', err.message);
    }

    const cached = getStoredProducts();
    if (cached) {
      const normalized = cached.map((p) => {
        if (p.id === 'flw-036' || p.id === 'flw-105') {
          return { ...p, category: 'Flowers', subCategory: 'Hand Bouquets' };
        }
        if (p.id === 'flw-218' || p.slug === 'amethyst-phalaenopsis-potted-living-orchid') {
          const base = PRODUCTS.find((b) => b.id === 'flw-218');
          if (base) {
            return { ...p, image: base.image, images: base.images };
          }
        }
        return p;
      });
      const existingIds = new Set(normalized.map((p) => p.id || p._id));
      const missing = PRODUCTS.filter((p) => !existingIds.has(p.id));
      if (missing.length > 0 || normalized !== cached) {
        const merged = [...normalized, ...missing];
        saveStoredProducts(merged);
        return merged;
      }
      return normalized;
    }

    // Initialize with atelier dataset
    saveStoredProducts(PRODUCTS);
    return PRODUCTS;
  },

  /**
   * Fetch single product by id or slug
   */
  async getProductByIdOrSlug(idOrSlug) {
    try {
      const response = await api.get(`/api/products/${idOrSlug}`);
      if (response.data && response.data.product) {
        const prod = response.data.product;
        if (prod.id === 'flw-218' || prod.slug === 'amethyst-phalaenopsis-potted-living-orchid') {
          const base = PRODUCTS.find((b) => b.id === 'flw-218');
          if (base) return { ...prod, image: base.image, images: base.images };
        }
        return prod;
      }
    } catch {
      // Fallback to local search
    }

    const all = getStoredProducts() || PRODUCTS;
    const found = all.find((p) => p.id === idOrSlug || p._id === idOrSlug || p.slug === idOrSlug) || all[0];
    if (found && (found.id === 'flw-218' || found.slug === 'amethyst-phalaenopsis-potted-living-orchid')) {
      const base = PRODUCTS.find((b) => b.id === 'flw-218');
      if (base) return { ...found, image: base.image, images: base.images };
    }
    return found;
  },

  /**
   * Admin: Create new product
   */
  async createProduct(productData) {
    const imgUrl = Array.isArray(productData.images)
      ? productData.images[0]
      : (productData.images || productData.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80');
    const imgArr = Array.isArray(productData.images) ? productData.images : [imgUrl];

    const slug = productData.slug || (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newProd = {
      id: `flw-${Date.now()}`,
      _id: `flw-${Date.now()}`,
      ...productData,
      slug,
      image: imgUrl,
      images: imgArr,
      stock: Number(productData.stock) || 10,
      inStock: (Number(productData.stock) || 10) > 0,
      price: Number(productData.price) || 2499,
      originalPrice: Number(productData.originalPrice) || (Number(productData.price) ? Number(productData.price) + 500 : 2999),
      createdAt: new Date().toISOString(),
    };

    // Attempt remote backend creation
    try {
      const response = await api.post('/api/products', newProd);
      if (response.data && response.data.product) {
        const remoteProd = response.data.product;
        const current = getStoredProducts() || [...PRODUCTS];
        saveStoredProducts([remoteProd, ...current.filter((p) => (p.id || p._id) !== (remoteProd.id || remoteProd._id))]);
        return response.data;
      }
    } catch (err) {
      console.warn('API createProduct failed, falling back to local persistence:', err.message);
    }

    // Resilient local persistence
    const current = getStoredProducts() || [...PRODUCTS];
    const updated = [newProd, ...current];
    saveStoredProducts(updated);
    return { success: true, product: newProd };
  },

  /**
   * Admin: Update product (ensures image and all fields update reliably)
   */
  async updateProduct(id, productData) {
    const imgUrl = Array.isArray(productData.images)
      ? productData.images[0]
      : (productData.images || productData.image);
    const imgArr = Array.isArray(productData.images) ? productData.images : [imgUrl];

    // Attempt remote backend update
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      if (response.data && response.data.product) {
        const remoteProd = response.data.product;
        const current = getStoredProducts() || [...PRODUCTS];
        const idx = current.findIndex((p) => p.id === id || p._id === id || p.slug === id);
        if (idx !== -1) {
          current[idx] = { ...current[idx], ...remoteProd };
        } else {
          current.unshift(remoteProd);
        }
        saveStoredProducts(current);
        return response.data;
      }
    } catch (err) {
      console.warn('API updateProduct failed, persisting to local storage:', err.message);
    }

    // Resilient local update
    const current = getStoredProducts() || [...PRODUCTS];
    const idx = current.findIndex((p) => p.id === id || p._id === id || p.slug === id);
    let updatedProduct;

    if (idx !== -1) {
      updatedProduct = {
        ...current[idx],
        ...productData,
        image: imgUrl,
        images: imgArr,
        stock: productData.stock !== undefined ? Number(productData.stock) : current[idx].stock,
        inStock: (productData.stock !== undefined ? Number(productData.stock) : current[idx].stock) > 0,
      };
      current[idx] = updatedProduct;
    } else {
      updatedProduct = {
        id,
        _id: id,
        ...productData,
        image: imgUrl,
        images: imgArr,
      };
      current.unshift(updatedProduct);
    }

    saveStoredProducts(current);
    return { success: true, product: updatedProduct };
  },

  /**
   * Admin: Delete product
   */
  async deleteProduct(id) {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (err) {
      console.warn('API deleteProduct failed, removing from local storage:', err.message);
    }

    const current = getStoredProducts() || [...PRODUCTS];
    const filtered = current.filter((p) => p.id !== id && p._id !== id && p.slug !== id);
    saveStoredProducts(filtered);
    return { success: true };
  },

  /**
   * Admin: Update live stock level
   */
  async updateStockLevel(id, stock) {
    try {
      await api.patch(`/api/products/${id}/stock`, { stock });
    } catch (err) {
      console.warn('API updateStockLevel failed, updating locally:', err.message);
    }

    const current = getStoredProducts() || [...PRODUCTS];
    const idx = current.findIndex((p) => p.id === id || p._id === id || p.slug === id);
    if (idx !== -1) {
      current[idx].stock = stock;
      current[idx].inStock = stock > 0;
      saveStoredProducts(current);
    }
    return { success: true, stock };
  },

  /**
   * Admin: Upload product image file and store locally
   */
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/api/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.warn('API image upload failed, handled via client FileReader:', err.message);
      return { success: false, message: 'Uploaded on client' };
    }
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
