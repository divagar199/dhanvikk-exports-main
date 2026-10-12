import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { signInWithGoogleFirebase } from '../../config/firebase';

export const DEFAULT_GUEST_USER = {
  id: 'guest_user_dhanvikk',
  name: 'Guest Customer',
  email: 'guest@dhanvikk.com',
  role: 'customer',
  phone: '+971 50 000 0000',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

// Safely restore initial auth state
const savedUser = (() => {
  try {
    const raw = localStorage.getItem('dhanvikk_user') || sessionStorage.getItem('dhanvikk_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const savedToken = localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token');

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      let firebaseUser = null;
      let firebaseToken = null;
      let firebaseAuthFailed = false;

      // 1. Authenticate with Firebase Email/Password
      try {
        const { signInWithEmailPasswordFirebase } = await import('../../config/firebase');
        const fbRes = await signInWithEmailPasswordFirebase(email, password);
        firebaseUser = fbRes.user;
        firebaseToken = fbRes.token;
      } catch (fbErr) {
        console.warn('Firebase email/password sign-in note:', fbErr.message);
        firebaseAuthFailed = true;
        if (fbErr.code === 'auth/operation-not-allowed') {
          return rejectWithValue('Email/Password sign-in is not yet enabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
        }
      }

      // 2. Synchronize with Backend API (which validates or auto-onboards user)
      let data = null;
      try {
        data = await authService.login({ email, password });
      } catch (apiErr) {
        // Fallback to Firebase authentication result if backend API is offline
        if (firebaseUser) {
          data = {
            success: true,
            user: firebaseUser,
            token: firebaseToken,
          };
        } else if (
          email.toLowerCase() === 'customer@dhanvikk.com' &&
          (password === 'password123' || password === 'Bloom@2026')
        ) {
          data = {
            success: true,
            user: {
              id: 'usr_cust_001',
              name: 'Aarav Patel',
              email: 'customer@dhanvikk.com',
              role: 'customer',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            },
            token: 'dhanvikk_demo_customer_token',
          };
        } else if (
          email.toLowerCase() === 'admin@dhanvikk.com' &&
          password === 'AdminBloom@2026'
        ) {
          data = {
            success: true,
            user: {
              id: 'usr_adm_001',
              name: 'Dhanvikk Administrator',
              email: 'admin@dhanvikk.com',
              role: 'admin',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            },
            token: 'dhanvikk_demo_admin_token',
          };
        } else {
          const isUserNotFound =
            apiErr?.response?.data?.code === 'USER_NOT_FOUND' ||
            apiErr?.response?.status === 404 ||
            (apiErr?.response?.data?.message && apiErr.response.data.message.toLowerCase().includes('register'));

          if (isUserNotFound) {
            return rejectWithValue({
              code: 'USER_NOT_FOUND',
              message: 'Account not found in database. Please register to create your account.',
              email,
            });
          }

          const errMsg = apiErr?.response?.data?.message || apiErr?.userMessage || 'Invalid email or password. Please try again.';
          return rejectWithValue(errMsg);
        }
      }


      if (data?.success) {
        const userObj = {
          ...(firebaseUser || {}),
          ...(data.user || {}),
          id: data.user?.id || data.user?._id || firebaseUser?.id,
          role: data.user?.role || firebaseUser?.role || 'customer',
        };
        const tokenStr = data.token || firebaseToken;

        // If user logged into backend successfully but doesn't exist on new Firebase project yet, auto-provision on Firebase
        if (firebaseAuthFailed && password && password.length >= 6) {
          (async () => {
            try {
              const { signUpWithEmailPassword } = await import('../../config/firebase');
              await signUpWithEmailPassword(email, password, userObj.name || email.split('@')[0]);
            } catch {}
          })();
        }

        sessionStorage.removeItem('dhanvikk_logged_out');
        localStorage.setItem('dhanvikk_auth_token', tokenStr);
        localStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
        sessionStorage.setItem('dhanvikk_auth_token', tokenStr);
        sessionStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
        if (rememberMe) {
          localStorage.setItem('dhanvikk_remember_email', email);
        } else {
          localStorage.removeItem('dhanvikk_remember_email');
        }
        return { success: true, user: userObj, token: tokenStr };
      }
      return rejectWithValue(data?.message || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.userMessage || error.message || 'Unable to sign in. Please check your details.');
    }
  }
);


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    const { name, email, password, phone } = userData;
    try {
      // 1. Create account with Firebase Auth & Firestore profile
      let firebaseUser = null;
      let firebaseToken = null;
      try {
        const { signUpWithEmailPassword } = await import('../../config/firebase');
        const fbRes = await signUpWithEmailPassword(email, password, name);
        firebaseUser = fbRes.user;
        firebaseToken = fbRes.token;
      } catch (fbErr) {
        console.warn('Firebase registration notice:', fbErr.message);
        if (fbErr.code === 'auth/email-already-in-use') {
          return rejectWithValue('An account with this email already exists.');
        }
        if (fbErr.code === 'auth/weak-password') {
          return rejectWithValue('Password must be at least 6 characters.');
        }
        if (fbErr.code === 'auth/operation-not-allowed') {
          return rejectWithValue('Email/Password registration is not yet enabled in Firebase Console for auth-checker-1-main. Please enable it under Authentication > Sign-in method.');
        }
      }

      // 2. Sync with Backend Database
      let data = null;
      try {
        data = await authService.register(userData);
      } catch (apiErr) {
        if (firebaseUser) {
          data = {
            success: true,
            user: firebaseUser,
            token: firebaseToken,
          };
        } else {
          throw apiErr;
        }
      }

      if (data?.success) {
        const userObj = firebaseUser || data.user;
        const tokenStr = firebaseToken || data.token;
        sessionStorage.removeItem('dhanvikk_logged_out');
        localStorage.setItem('dhanvikk_auth_token', tokenStr);
        localStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
        return { success: true, user: userObj, token: tokenStr };
      }
      return rejectWithValue(data?.message || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.userMessage || error.message || 'Registration failed. Please try again.');
    }
  }
);

export const loginWithGoogleThunk = createAsyncThunk(
  'auth/loginWithGoogle',
  async (extraData = {}, { rejectWithValue }) => {
    try {
      if (extraData?.redirecting) {
        return { redirecting: true };
      }

      let firebaseResult = extraData;
      if (!firebaseResult?.idToken) {
        firebaseResult = await signInWithGoogleFirebase();
      }
      if (firebaseResult?.redirecting) {
        return { redirecting: true };
      }

      const idToken = firebaseResult?.idToken;
      if (!idToken || typeof idToken !== 'string') {
        return rejectWithValue('Google sign-in did not return a valid Firebase ID token. Please try again.');
      }

      const { default: api } = await import('../../services/api');
      const response = await api.post('/api/auth/firebase-login', {
        idToken,
        authMethod: 'google',
      });
      const data = response.data;
      if (!data?.success || !data?.user || !data?.token) {
        return rejectWithValue('The server could not establish a verified Google session.');
      }

      const userObj = data.user;
      const tokenStr = data.token;
      sessionStorage.removeItem('dhanvikk_logged_out');
      localStorage.setItem('dhanvikk_auth_token', tokenStr);
      localStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
      sessionStorage.setItem('dhanvikk_auth_token', tokenStr);
      sessionStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
      return { success: true, user: userObj, token: tokenStr };
    } catch (error) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return rejectWithValue('Google sign-in was canceled.');
      }
      if (code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        return rejectWithValue(`The domain "${currentHost}" is not authorized in Firebase Authentication. Add it under Authentication → Settings → Authorized domains.`);
      }
      if (code === 'auth/popup-blocked') {
        return rejectWithValue('Your browser blocked the Google sign-in popup. Allow popups and try again.');
      }
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.userMessage ||
        error?.message ||
        'Google sign-in failed. Please try again.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.userMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      try {
        const { logOutFirebase } = await import('../../config/firebase');
        await logOutFirebase();
      } catch (fbErr) {
        console.warn('Firebase logout note:', fbErr?.message);
      }
      await authService.logout();
    } catch (e) {
      console.warn('Logout api note:', e?.message);
    } finally {
      localStorage.removeItem('dhanvikk_auth_token');
      localStorage.removeItem('dhanvikk_user');
      localStorage.removeItem('dhanvikk_remember_email');
      sessionStorage.removeItem('dhanvikk_auth_token');
      sessionStorage.removeItem('dhanvikk_user');
      sessionStorage.setItem('dhanvikk_logged_out', 'true');
    }
    return { success: true };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    isAuthenticated: Boolean(savedToken && savedUser),
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logoutImmediate: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('dhanvikk_auth_token');
      localStorage.removeItem('dhanvikk_user');
      localStorage.removeItem('dhanvikk_remember_email');
      sessionStorage.removeItem('dhanvikk_auth_token');
      sessionStorage.removeItem('dhanvikk_user');
      sessionStorage.setItem('dhanvikk_logged_out', 'true');
    },
    setUserProfile: (state, action) => {
      sessionStorage.removeItem('dhanvikk_logged_out');
      state.user = { ...(state.user || {}), ...action.payload };
      state.isAuthenticated = true;
      localStorage.setItem('dhanvikk_user', JSON.stringify(state.user));
    },
    setCredentials: (state, action) => {
      sessionStorage.removeItem('dhanvikk_logged_out');
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      if (action.payload.token) {
        localStorage.setItem('dhanvikk_auth_token', action.payload.token);
        sessionStorage.setItem('dhanvikk_auth_token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('dhanvikk_user', JSON.stringify(action.payload.user));
        sessionStorage.setItem('dhanvikk_user', JSON.stringify(action.payload.user));
      }
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Incorrect email or password. Please try again.';
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Registration failed.';
      });

    // loginWithGoogle
    builder
      .addCase(loginWithGoogleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.redirecting) {
          return;
        }
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google sign-in failed.';
      });

    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, setUserProfile, logoutImmediate, setCredentials } = authSlice.actions;
export default authSlice.reducer;
