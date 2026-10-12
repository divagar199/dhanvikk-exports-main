import {
  loginWithEmailPassword,
  registerUser,
  loginWithFirebase,
  loginWithGooglePayload,
  formatUserResponse,
} from '../services/auth.service.js';
import { generateToken } from '../config/jwt.js';
import { decryptPortalKey } from '../utils/cryptoUtil.js';
import { UserModel } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';

const setAuthCookie = (res, token) => {
  res.cookie('dhanvikk_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Client';

    const result = await loginWithEmailPassword({ email, password, ip, userAgent });
    setAuthCookie(res, result.token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Client';

    const result = await registerUser({
      ...req.body,
      ip,
      userAgent,
    });
    setAuthCookie(res, result.token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Dhanvikk Blooms. 🌸',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Google Auth';
    const result = await loginWithFirebase({
      ...req.body,
      authMethod: 'google',
      ip,
      userAgent,
    });
    setAuthCookie(res, result.token);
    return res.status(200).json({
      success: true,
      message: result.isNew ? 'Google account connected successfully.' : 'Google sign-in successful.',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const firebaseLogin = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Firebase Auth';

    const result = await loginWithFirebase({
      ...req.body,
      ip,
      userAgent,
    });
    setAuthCookie(res, result.token);

    return res.status(200).json({
      success: true,
      message: 'Firebase authentication verified successfully',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const initiateGoogleOAuth = (req, res) => {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';
  const callbackUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/google/callback`);
  const scope = encodeURIComponent('openid profile email');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=${scope}&prompt=select_account`;
  return res.redirect(googleAuthUrl);
};

export const googleOAuthCallback = async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect(`dhanvikk://auth/google-callback?error=${encodeURIComponent(error || 'cancelled')}`);
    }

    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange token with Google');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const cleanEmail = (profile.email || '').toLowerCase().trim();

    const result = await loginWithGooglePayload({
      email: cleanEmail,
      name: profile.name,
      avatar: profile.picture,
      ip: req.ip,
      userAgent: 'Google OAuth Redirect',
    });

    const redirectUrl = `dhanvikk://auth/google-callback?token=${encodeURIComponent(
      result.token
    )}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err.message);
    return res.redirect(`dhanvikk://auth/google-callback?error=${encodeURIComponent(err.message || 'auth_failed')}`);
  }
};

export const logout = async (req, res) => {
  res.cookie('dhanvikk_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const verifyPortalKey = async (req, res, next) => {
  try {
    const { portalKey } = req.body;
    if (!portalKey) {
      return res.status(400).json({ success: false, message: 'Portal key is required' });
    }

    const decrypted = decryptPortalKey(portalKey);
    if (!decrypted || !decrypted.email) {
      return res.status(401).json({ success: false, message: 'Invalid or expired portal key' });
    }

    const user = await UserModel.findOne({ email: decrypted.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    return res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
