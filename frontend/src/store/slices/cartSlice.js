import { createSlice } from '@reduxjs/toolkit';

const getUserCartKey = () => {
  try {
    const rawUser = localStorage.getItem('dhanvikk_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const id = u.id || u._id || u.email;
      if (id) return `dhanvikk_cart_${String(id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    }
  } catch {}
  return 'dhanvikk_cart';
};

const loadSavedCart = () => {
  try {
    const userKey = getUserCartKey();
    const raw = localStorage.getItem(userKey) || localStorage.getItem('dhanvikk_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    const userKey = getUserCartKey();
    localStorage.setItem(userKey, JSON.stringify(items));
    localStorage.setItem('dhanvikk_cart', JSON.stringify(items));
  } catch {
    // ignore
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadSavedCart(),
    isOpen: false,
  },
  reducers: {
    setUserCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      saveCart(state.items);
    },
    addItem: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        state.items.push({
          ...product,
          quantity: product.quantity || 1,
        });
      }
      saveCart(state.items);
      state.isOpen = true; // Auto-open cart preview on add
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) item.quantity = quantity;
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  setUserCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;
