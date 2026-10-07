import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

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
      // 1. Authenticate with Firebase Email/Password
      let firebaseUser = null;
      let firebaseToken = null;
      try {
        const { signInWithEmailPasswordFirebase } = await import('../../config/firebase');
        const fbRes = await signInWithEmailPasswordFirebase(email, password);
        firebaseUser = fbRes.user;
        firebaseToken = fbRes.token;
      } catch (fbErr) {
        console.warn('Firebase email/password sign-in note:', fbErr.message);
        // If Firebase error is invalid credentials, propagate cleanly
        if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          return rejectWithValue('Invalid email or password. Please try again.');
        }
      }

      // 2. Synchronize with Backend API (if available)
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
      let firebasePayload = { ...extraData };
      let firebaseUser = null;
      let firebaseToken = null;

      // If already authenticated via 1-click Google pre-fill in Register page
      if (extraData?.googleUid && extraData?.email) {
        firebaseUser = {
          id: extraData.googleUid,
          name: extraData.name || extraData.email.split('@')[0],
          email: extraData.email,
          avatar: extraData.avatar || '',
          phone: extraData.phone || '',
          role: 'customer',
        };
        firebaseToken = localStorage.getItem('dhanvikk_auth_token') || `fb_${extraData.googleUid}`;
      } else {
        try {
          const { signInWithGoogleFirebase } = await import('../../config/firebase');
          const firebaseRes = await signInWithGoogleFirebase();
          if (firebaseRes?.user) {
            firebaseUser = firebaseRes.user;
            firebaseToken = firebaseRes.token;
            firebasePayload = {
              ...firebasePayload,
              name: firebaseRes.user.name,
              email: firebaseRes.user.email,
              avatar: firebaseRes.user.avatar,
              phone: firebaseRes.user.phone || '',
              googleUid: firebaseRes.user.id,
            };
          }
        } catch (fbErr) {
          console.error('Firebase Google Sign-In interaction:', fbErr);
          const errorCode = fbErr?.code || '';
          if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
            return rejectWithValue('Google sign-in was canceled.');
          }
          if (errorCode === 'auth/popup-blocked') {
            return rejectWithValue('Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
          }
          if (errorCode === 'auth/unauthorized-domain') {
            const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
            return rejectWithValue(`The domain "${currentHost}" is not authorized in Firebase Auth. Please verify Authorized Domains in Firebase Console.`);
          }
          if (errorCode === 'auth/network-request-failed') {
            return rejectWithValue('Network connection error during Google sign-in. Please check your internet connection.');
          }
          return rejectWithValue(fbErr?.message || 'Google sign-in could not be completed.');
        }
      }

      if (!firebaseUser) {
        return rejectWithValue('Google authentication was not completed.');
      }

      // Synchronize authenticated profile with backend API (with 3.5s timeout guard so users are NEVER stuck)
      let data = null;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend sync timeout')), 3500)
        );
        data = await Promise.race([
          authService.loginWithGoogle(firebasePayload),
          timeoutPromise,
        ]);
      } catch (apiErr) {
        console.warn('Backend API note for Google login (proceeding with verified Firebase session):', apiErr?.message);
        // Fall back to verified Firebase authentication if backend API is temporarily slow/cold-starting
        data = {
          success: true,
          user: firebaseUser,
          token: firebaseToken || `fb_token_${firebaseUser.id}`,
        };
        // Fire-and-forget sync in the background so backend database still captures the user
        authService.loginWithGoogle(firebasePayload).catch(() => {});
      }

      if (data?.success) {
        const userObj = {
          ...firebaseUser,
          ...(data.user || {}),
          // Ensure real Google credentials take precedence
          id: firebaseUser.id || data.user?.id || data.user?._id,
          name: firebaseUser.name || data.user?.name || firebaseUser.email.split('@')[0],
          email: firebaseUser.email || data.user?.email,
          avatar: firebaseUser.avatar || data.user?.avatar || '',
          role: data.user?.role || firebaseUser.role || 'customer',
        };
        const tokenStr = firebaseToken || data.token || `dhanvikk_token_${userObj.id}`;
        sessionStorage.removeItem('dhanvikk_logged_out');
        localStorage.setItem('dhanvikk_auth_token', tokenStr);
        localStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
        sessionStorage.setItem('dhanvikk_auth_token', tokenStr);
        sessionStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
        return { success: true, user: userObj, token: tokenStr };
      }
      return rejectWithValue(data?.message || 'Google sign-in failed');
    } catch (error) {
      return rejectWithValue(error.userMessage || error.message || 'Google sign-in failed. Please try again.');
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
    isAuthenticated: Boolean(savedToken || savedUser),
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

export const { clearAuthError, setUserProfile, logoutImmediate } = authSlice.actions;
export default authSlice.reducer;
