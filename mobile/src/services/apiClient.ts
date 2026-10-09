import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const TOKEN_STORAGE_KEY = 'dhanvikk_auth_token';

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {}
      return null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

// Centralized API configuration with local & production fallbacks
export const DEFAULT_PRODUCTION_API = 'https://dhanvikk-exports-api.onrender.com';

// For local testing on Android emulator use 10.0.2.2, for iOS/Web use localhost
export const getLocalhostUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || DEFAULT_PRODUCTION_API;

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let inMemoryToken: string | null = null;

export const setAuthTokenMemory = (token: string | null) => {
  inMemoryToken = token;
};

// Request interceptor to attach JWT token securely from storage or memory
apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token = inMemoryToken;
      if (!token) {
        token = await authStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) inMemoryToken = token;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage error fallback
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent, user-friendly error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        friendlyMessage = 'The request timed out. Please check your connection and try again.';
      } else {
        friendlyMessage = "Unable to connect to Dhanvikk server. Please check your internet connection.";
      }
    } else {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          friendlyMessage = data?.message || 'Session expired or invalid credentials. Please log in again.';
          break;
        case 403:
          friendlyMessage = data?.message || 'You do not have permission to access this resource.';
          break;
        case 404:
          friendlyMessage = data?.message || 'The requested flower product or order was not found.';
          break;
        case 409:
          friendlyMessage = data?.message || 'An account with this email already exists.';
          break;
        case 422:
          friendlyMessage = data?.message || 'Please check your inputs and try again.';
          break;
        case 429:
          friendlyMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        case 500:
        case 502:
        case 503:
          friendlyMessage = 'Our floristry server is busy. Please try again shortly.';
          break;
        default:
          friendlyMessage = data?.message || 'Unable to complete request. Please try again.';
      }
    }

    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
