import axios from 'axios';

// Centralized Axios instance
const normalizedBaseURL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedBaseURL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage or memory
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhanvikk_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent, user-friendly error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        friendlyMessage = 'The request timed out. Please check your connection and try again.';
      } else {
        friendlyMessage = "We couldn't connect right now. Please check your internet connection and try again.";
      }
    } else {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          friendlyMessage = data?.message || 'Incorrect email or password. Please try again.';
          break;
        case 403:
          friendlyMessage = data?.message || 'You do not have permission to access this resource.';
          break;
        case 404:
          friendlyMessage = data?.message || 'The requested resource could not be found.';
          break;
        case 422:
          friendlyMessage = data?.message || 'Please check your inputs and try again.';
          break;
        case 429:
          friendlyMessage = 'Too many attempts. Please wait a moment before trying again.';
          break;
        case 500:
        case 502:
        case 503:
          friendlyMessage = 'Something went wrong on our side. Please try again shortly.';
          break;
        default:
          friendlyMessage = data?.message || 'Unable to complete request. Please try again.';
      }
    }

    // Attach processed message to error
    error.userMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default api;
