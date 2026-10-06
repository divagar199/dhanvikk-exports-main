import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const getUserWishlistKey = () => {
  try {
    const rawUser = localStorage.getItem('dhanvikk_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const id = u.id || u._id || u.email;
      if (id) return `dhanvikk_wishlist_${String(id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    }
  } catch {}
  return 'dhanvikk_wishlist';
};

const loadSavedWishlist = () => {
  try {
    const userKey = getUserWishlistKey();
    const raw = localStorage.getItem(userKey) || localStorage.getItem('dhanvikk_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveWishlistToStorage = (items) => {
  try {
    const userKey = getUserWishlistKey();
    localStorage.setItem(userKey, JSON.stringify(items));
    localStorage.setItem('dhanvikk_wishlist', JSON.stringify(items));
  } catch {
    // ignore
  }
};

// Normalize product item for wishlist storage
export const normalizeWishlistItem = (product) => {
  if (!product) return null;
  const id = product.id || product._id || product.slug;
  const image =
    product.image ||
    (Array.isArray(product.images) && product.images[0]) ||
    '/images/products/crimson-heart.webp';

  return {
    id: String(id),
    name: product.name || 'Luxury Floral Bouquet',
    slug: product.slug || String(id),
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    image,
    category: product.category || 'Flowers',
    notes: product.description || product.notes || 'Exclusive luxury hand-tied arrangement',
    rating: product.rating || 4.9,
    tag: product.tag || 'Best Seller',
    stock: product.stock !== undefined ? product.stock : 25,
    addedAt: new Date().toISOString(),
  };
};

// Check if a product is in a wishlist items list
export const isProductInWishlist = (items, product) => {
  if (!product || !Array.isArray(items)) return false;
  const pId = String(product.id || product._id || '');
  const pSlug = product.slug ? String(product.slug) : '';
  return items.some((item) => {
    const iId = String(item.id || item._id || '');
    const iSlug = item.slug ? String(item.slug) : '';
    return (pId && iId && pId === iId) || (pSlug && iSlug && pSlug === iSlug);
  });
};

// Optional async background sync with backend for authenticated users
export const syncWishlistWithBackend = createAsyncThunk(
  'wishlist/syncWithBackend',
  async (product, { rejectWithValue }) => {
    try {
      const res = await authService.toggleWishlist(product);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadSavedWishlist(),
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      saveWishlistToStorage(state.items);
    },
    addToWishlist: (state, action) => {
      const item = normalizeWishlistItem(action.payload);
      if (!item) return;
      const exists = isProductInWishlist(state.items, item);
      if (!exists) {
        state.items.unshift(item);
        saveWishlistToStorage(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const target = action.payload;
      const targetId = typeof target === 'object' ? String(target?.id || target?._id || '') : String(target);
      const targetSlug = typeof target === 'object' ? String(target?.slug || '') : '';

      state.items = state.items.filter((item) => {
        const iId = String(item.id || item._id || '');
        const iSlug = item.slug ? String(item.slug) : '';
        const matchId = targetId && iId && targetId === iId;
        const matchSlug = targetSlug && iSlug && targetSlug === iSlug;
        return !matchId && !matchSlug;
      });
      saveWishlistToStorage(state.items);
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const exists = isProductInWishlist(state.items, product);

      if (exists) {
        const pId = String(product.id || product._id || '');
        const pSlug = product.slug ? String(product.slug) : '';
        state.items = state.items.filter((item) => {
          const iId = String(item.id || item._id || '');
          const iSlug = item.slug ? String(item.slug) : '';
          const matchId = pId && iId && pId === iId;
          const matchSlug = pSlug && iSlug && pSlug === iSlug;
          return !matchId && !matchSlug;
        });
      } else {
        const normalized = normalizeWishlistItem(product);
        if (normalized) {
          state.items.unshift(normalized);
        }
      }
      saveWishlistToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlistToStorage([]);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncWishlistWithBackend.fulfilled, (state, action) => {
      if (action.payload?.savedBouquets && Array.isArray(action.payload.savedBouquets)) {
        // Optionally merge or keep in sync
      }
    });
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
