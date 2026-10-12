import { randomBytes, timingSafeEqual } from 'node:crypto';
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

const GOOGLE_STATE_COOKIE = 'dhanvikk_google_oauth_state';
const GOOGLE_OAUTH_CODES = new Map();

const googleOAuthConfig = (req) => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_OAUTH_CALLBACK_URL ||
    (process.env.NODE_ENV !== 'production'
      ? `${req.protocol}://${req.get('host')}/api/auth/google/callback`
      : ''),
  mobileRedirectUri: process.env.GOOGLE_OAUTH_MOBILE_REDIRECT_URI || 'dhanvikk://auth/google-callback',
});

const redirectToMobileAuth = (res, redirectUri, params) => {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return res.redirect(url.toString());
};

export const initiateGoogleOAuth = (req, res) => {
  const { clientId, clientSecret, redirectUri } = googleOAuthConfig(req);
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on the server. Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_OAUTH_CALLBACK_URL.',
    });
  }

  const state = randomBytes(32).toString('hex');
  res.cookie(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    path: '/api/auth/google',
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

export const googleOAuthCallback = async (req, res) => {
  const { mobileRedirectUri, clientId, clientSecret, redirectUri } = googleOAuthConfig(req);
  const cookieState = req.cookies?.[GOOGLE_STATE_COOKIE] || '';
  const queryState = typeof req.query.state === 'string' ? req.query.state : '';
  const stateValid = cookieState.length > 0 &&
    cookieState.length === queryState.length &&
    timingSafeEqual(Buffer.from(cookieState), Buffer.from(queryState));

  res.clearCookie(GOOGLE_STATE_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google',
  });

  if (!stateValid) {
    return redirectToMobileAuth(res, mobileRedirectUri, { error: 'oauth_state_invalid' });
  }

  if (req.query.error || typeof req.query.code !== 'string' || !req.query.code) {
    return redirectToMobileAuth(res, mobileRedirectUri, { error: 'google_sign_in_cancelled' });
  }

  try {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth is not configured on the server.');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error('Google authorization code exchange failed.');
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json().catch(() => ({}));
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) {
      throw new Error('Google did not return a verified user profile.');
    }

    const result = await loginWithGooglePayload({
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      ip: req.ip,
      userAgent: 'Google OAuth Redirect',
    });

    const now = Date.now();
    for (const [storedCode, entry] of GOOGLE_OAUTH_CODES.entries()) {
      if (entry.expiresAt <= now) GOOGLE_OAUTH_CODES.delete(storedCode);
    }
    const exchangeCode = randomBytes(32).toString('hex');
    GOOGLE_OAUTH_CODES.set(exchangeCode, {
      token: result.token,
      user: result.user,
      expiresAt: now + 60 * 1000,
    });

    return redirectToMobileAuth(res, mobileRedirectUri, { code: exchangeCode });
  } catch (err) {
    console.error('Google OAuth callback failed:', err.message);
    return redirectToMobileAuth(res, mobileRedirectUri, { error: 'google_sign_in_failed' });
  }
};

export const exchangeGoogleOAuthCode = (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code) {
    return res.status(400).json({ success: false, message: 'Google sign-in code is required.' });
  }

  const entry = GOOGLE_OAUTH_CODES.get(code);
  GOOGLE_OAUTH_CODES.delete(code);
  if (!entry || entry.expiresAt <= Date.now()) {
    return res.status(401).json({ success: false, message: 'Google sign-in code expired or already used. Please sign in again.' });
  }

  setAuthCookie(res, entry.token);
  return res.status(200).json({
    success: true,
    message: 'Google sign-in successful.',
    user: entry.user,
    token: entry.token,
  });
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
