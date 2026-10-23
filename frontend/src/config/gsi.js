/**
 * Google Identity Services (GSI) Singleton Service
 * Ensures window.google.accounts.id.initialize is called STRICTLY ONCE across the app lifecycle.
 */

export const GOOGLE_CLIENT_ID = '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';

let currentCredentialHandler = null;
let isInitializing = false;

/**
 * Register the active callback for Google Identity Services credential response.
 * Updating the handler does NOT require calling initialize() again.
 */
export const setGsiCredentialHandler = (handler) => {
  currentCredentialHandler = typeof handler === 'function' ? handler : null;
};

/**
 * Initialize Google Identity Services globally, strictly once.
 */
export const initGoogleIdentityServices = () => {
  if (typeof window === 'undefined') return false;

  // Already initialized globally
  if (window.__dhanvikk_gsi_initialized) {
    return true;
  }

  // Check if GSI client script is loaded on window
  if (!window.google?.accounts?.id) {
    return false;
  }

  if (isInitializing) return false;
  isInitializing = true;

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response?.credential && typeof currentCredentialHandler === 'function') {
          try {
            currentCredentialHandler(response.credential);
          } catch (err) {
            console.error('Error in GSI credential handler:', err);
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    window.__dhanvikk_gsi_initialized = true;
    return true;
  } catch (error) {
    console.warn('GSI initialize notice:', error?.message);
    return false;
  } finally {
    isInitializing = false;
  }
};

/**
 * Render the official Google Sign-In button into a DOM container element.
 * Immune to browser popup blocking when rendered directly into an empty container.
 */
export const renderGsiButton = (containerElement, options = {}) => {
  if (!containerElement || typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  // Ensure initialized first
  initGoogleIdentityServices();

  try {
    const width = options.width || containerElement.offsetWidth || 340;
    // Clear container to avoid duplicate nested buttons
    containerElement.innerHTML = '';
    window.google.accounts.id.renderButton(containerElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(Math.max(width, 240), 400),
      ...options,
    });
    return true;
  } catch (err) {
    console.warn('GSI renderButton notice:', err?.message);
    return false;
  }
};
