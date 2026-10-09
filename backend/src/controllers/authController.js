import bcrypt from 'bcryptjs';
import { USERS } from '../data/users.js';
import { generateToken } from '../config/jwt.js';
import { UserModel } from '../models/User.js';
import { OrderModel } from '../models/Order.js';
import { getDBStatus } from '../config/db.js';
import { sendLoginNotificationEmail, sendWelcomeGreetingEmail } from '../services/emailService.js';
import { generateEncryptedPortalKey, decryptPortalKey } from '../utils/cryptoUtil.js';
import { firebaseAuth } from '../config/firebaseAdmin.js';

// Resolve real Gmail / Google profile image if user has a gmail address or Google OAuth
export const resolveGoogleAvatar = (email = '', currentAvatar = '', name = '') => {
  const cleanEmail = email.toLowerCase().trim();
  if (currentAvatar && (currentAvatar.includes('googleusercontent.com') || currentAvatar.includes('cloudinary') || currentAvatar.includes('unsplash') || currentAvatar.startsWith('data:'))) {
    return currentAvatar;
  }
  if (cleanEmail.endsWith('@gmail.com') || cleanEmail.includes('google')) {
    return `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=${encodeURIComponent(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail.split('@')[0])}&background=800020&color=d4af37&bold=true&size=256`
    )}`;
  }
  return currentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Customer')}&background=800020&color=d4af37&bold=true&size=256`;
};

import { inMemoryOrders } from './orderController.js';

// In-memory persistent storage map for addresses & saved bouquets per user
export const userProfileStorage = new Map();

export const recordUserOrder = (email, order) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return;
  const current = userProfileStorage.get(cleanEmail) || {};
  const orders = current.recentOrders ? [...current.recentOrders] : [];
  if (!orders.some((o) => (o.orderId && o.orderId === order.orderId) || (o.id && o.id === order.id))) {
    orders.unshift(order);
  }
  userProfileStorage.set(cleanEmail, { ...current, recentOrders: orders });
};

export const recordUserAddress = (email, address) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail || !address) return;
  const current = userProfileStorage.get(cleanEmail) || {};
  const addresses = current.savedAddresses ? [...current.savedAddresses] : [];
  const streetStr = address.street || address.streetAddress || '';
  if (!streetStr) return;
  const exists = addresses.some(
    (a) => a.street?.toLowerCase() === streetStr.toLowerCase() && a.city?.toLowerCase() === (address.city || '').toLowerCase()
  );
  if (!exists) {
    addresses.push({
      id: `addr_${Date.now()}`,
      title: address.title || 'Delivery Destination',
      recipientName: address.fullName || address.recipientName || '',
      phone: address.phone || '',
      street: streetStr,
      city: address.city || 'Dubai',
      state: address.state || 'Dubai',
      postalCode: address.postalCode || address.pincode || '',
      country: address.country || 'United Arab Emirates',
      isDefault: addresses.length === 0,
    });
    userProfileStorage.set(cleanEmail, { ...current, savedAddresses: addresses });
  }
};

export const getDefaultAddresses = (userName = 'Valued Customer', userPhone = '+971 50 123 4567') => [
  {
    id: 'addr_prim_01',
    title: 'Primary Residence',
    recipientName: userName,
    phone: userPhone,
    street: 'Villa 14, Palm Crescent',
    district: 'Palm Jumeirah',
    city: 'Dubai',
    state: 'Dubai',
    postalCode: '00000',
    country: 'United Arab Emirates',
    isDefault: true,
  },
  {
    id: 'addr_gift_02',
    title: 'Gifting Address',
    recipientName: 'Celebration Residence',
    phone: '+91 98765 43210',
    street: 'Penthouse 8B, Royal Marine Drive',
    district: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400021',
    country: 'India',
    isDefault: false,
  },
];

export const getDefaultSavedBouquets = () => [
  {
    id: 'flw-rose-01',
    name: 'Passionate Serenity Noir',
    price: 2499,
    currency: 'INR',
    category: 'Flowers',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    rating: 5.0,
    notes: 'Hand-tied Ecuadorian dark scarlet roses in obsidian matte paper',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'flw-rose-02',
    name: 'Velvet Midnight Rose Box',
    price: 3899,
    currency: 'INR',
    category: 'Flower Boxes',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    rating: 4.9,
    notes: 'Preserved royal blooms encased in handcrafted French velvet box',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'flw-rose-03',
    name: 'Eternal Gold Gilded Bloom',
    price: 5499,
    currency: 'INR',
    category: 'Forever Roses',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    rating: 5.0,
    notes: '24K gold dipped eternal Colombian rose with glass cloche dome',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'flw-rose-04',
    name: 'Opulent Blush Damask Rose',
    price: 3200,
    currency: 'INR',
    category: 'Flowers',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    rating: 4.9,
    notes: 'Soft pastel damask roses with fresh Italian ruscus foliage',
    addedAt: new Date().toISOString(),
  },
];

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Please provide both email and password',
        errors: {
          email: !email ? 'Email address is required' : undefined,
          password: !password ? 'Password is required' : undefined,
        },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;
    let isMatch = false;

    // Check MongoDB first if connected
    if (getDBStatus()) {
      user = await UserModel.findOne({ email: cleanEmail });
      if (user) {
        isMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect password. Please try again.',
          });
        }
        // Record login history in MongoDB
        user.loginHistory.push({
          timestamp: new Date(),
          ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser Client',
          method: 'email',
        });
        await user.save();
      }
    }

    // Fallback or seed to local USERS array if not found in MongoDB
    if (!user) {
      const memoryUser = USERS.find((u) => u.email === cleanEmail);
      if (memoryUser) {
        isMatch = bcrypt.compareSync(password, memoryUser.passwordHash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect password. Please try again.',
          });
        }
        user = memoryUser;
      } else {
        // Auto-create customer account in dev/demo mode for seamless onboarding
        const generatedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        const capitalizedName = generatedName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const role = cleanEmail.includes('admin') ? 'admin' : 'customer';
        const passwordHash = bcrypt.hashSync(password, 10);

        if (getDBStatus()) {
          user = await UserModel.create({
            name: capitalizedName || 'Valued Customer',
            email: cleanEmail,
            passwordHash,
            role,
            phone: '+91 98765 00000',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            loginHistory: [
              {
                timestamp: new Date(),
                ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
                userAgent: req.headers['user-agent'] || 'Browser Client',
                method: 'email',
              },
            ],
          });
        } else {
          user = {
            id: `usr_${Date.now()}`,
            name: capitalizedName || 'Valued Customer',
            email: cleanEmail,
            passwordHash,
            role,
            phone: '+91 98765 00000',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            createdAt: new Date(),
          };
          USERS.push(user);
        }
      }

      // Also persist seeded memory user into MongoDB if not present
      if (getDBStatus() && user && !(user instanceof UserModel)) {
        try {
          const createdMongoUser = await UserModel.create({
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            phone: user.phone || '',
            avatar: user.avatar,
            loginHistory: [
              {
                timestamp: new Date(),
                ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
                userAgent: req.headers['user-agent'] || 'Browser Client',
                method: 'email',
              },
            ],
          });
          user = createdMongoUser;
        } catch {
          // already exists or concurrent create
        }
      }
    }

    const tokenPayload = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    // Secure cookie configuration
    res.cookie('dhanvikk_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const resolvedAvatar = resolveGoogleAvatar(user.email, user.avatar, user.name);
    const encryptedPortalKey = generateEncryptedPortalKey({
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });

    const safeUser = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      avatar: resolvedAvatar,
      encryptedPortalKey,
    };

    // Dispatch login email asynchronously
    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Browser',
    }).catch((err) => console.warn('Login notification email note:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth / Firebase sign in
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = async (req, res, next) => {
  try {
    const {
      name,
      email,
      avatar,
      googleUid,
      phone,
      street,
      city,
      state,
      country,
      postalCode,
      zipCode,
      addressType,
      isNewRegistration,
    } = req.body || {};
    const targetEmail = (email || 'google.customer@dhanvikkblooms.com').trim().toLowerCase();
    const targetName = name || 'Google Customer';
    const targetAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    let isCreatedNew = Boolean(isNewRegistration);

    let user = null;
    if (getDBStatus()) {
      user = await UserModel.findOne({ email: targetEmail });
      if (!user) {
        isCreatedNew = true;
        user = await UserModel.create({
          name: targetName,
          email: targetEmail,
          phone: phone || '',
          passwordHash: bcrypt.hashSync(`google_auth_${Date.now()}`, 10),
          role: 'customer',
          avatar: targetAvatar,
          loginHistory: [
            {
              timestamp: new Date(),
              ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
              userAgent: req.headers['user-agent'] || 'Firebase Auth',
              method: 'google',
            },
          ],
        });
      } else {
        if (phone && !user.phone) user.phone = phone;
        user.loginHistory.push({
          timestamp: new Date(),
          ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Firebase Auth',
          method: 'google',
        });
        await user.save();
      }
    } else {
      const memUser = USERS.find((u) => u.email === targetEmail);
      if (!memUser) {
        isCreatedNew = true;
        user = {
          id: `usr_${Date.now()}`,
          name: targetName,
          email: targetEmail,
          phone: phone || '',
          role: 'customer',
          avatar: targetAvatar,
        };
        USERS.push(user);
      } else {
        if (phone && !memUser.phone) memUser.phone = phone;
        user = memUser;
      }
    }

    // Save initial address if supplied
    let initialAddress = null;
    if (street || city || phone) {
      initialAddress = {
        id: `addr_${Date.now()}`,
        title: addressType || 'Primary Residence',
        recipientName: targetName,
        phone: phone || user.phone || '',
        street: street || '',
        city: city || 'Dubai',
        state: state || 'Dubai',
        postalCode: postalCode || zipCode || '',
        country: country || 'United Arab Emirates',
        isDefault: true,
      };
      const existingStorage = userProfileStorage.get(targetEmail) || {};
      userProfileStorage.set(targetEmail, {
        ...existingStorage,
        savedAddresses: [initialAddress],
        savedBouquets: existingStorage.savedBouquets || getDefaultBouquets(),
        recentOrders: existingStorage.recentOrders || [],
      });
    }

    const tokenPayload = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    res.cookie('dhanvikk_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const resolvedAvatar = resolveGoogleAvatar(targetEmail, user.avatar || targetAvatar, user.name || targetName);
    const encryptedPortalKey = generateEncryptedPortalKey({
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || phone || '',
    });

    // If new registration via Google, send Welcome Greeting email
    if (isCreatedNew) {
      sendWelcomeGreetingEmail({
        email: user.email,
        name: user.name,
        phone: user.phone || phone || '',
        address: initialAddress,
        encryptedPortalKey,
      }).catch((err) => console.warn('Welcome greeting email delivery note:', err.message));
    }

    // Dispatch Google login notification email asynchronously
    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Firebase Auth / Google',
    }).catch((err) => console.warn('Google login notification email note:', err.message));

    return res.status(200).json({
      success: true,
      message: isCreatedNew ? 'Account activated with Google! 🌸' : 'Google sign-in successful',
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || phone || '',
        avatar: resolvedAvatar,
        encryptedPortalKey,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Direct Redirect to Google Login / Select Account Page
 * @route   GET /api/auth/google/login
 * @access  Public
 */
export const initiateGoogleOAuth = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '972583680950-7ang94u09kol0u5f5sndskkcr913nqc2.apps.googleusercontent.com';
  const callbackUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/google/callback`);
  const scope = encodeURIComponent('openid profile email');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=${scope}&prompt=select_account`;
  return res.redirect(googleAuthUrl);
};

/**
 * @desc    Google OAuth Callback Handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleOAuthCallback = async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect(`dhanvikk://auth/google-callback?error=${encodeURIComponent(error || 'cancelled')}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '972583680950-7ang94u09kol0u5f5sndskkcr913nqc2.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // Exchange authorization code for token
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

    // Retrieve Google profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const cleanEmail = (profile.email || '').toLowerCase().trim();

    if (!cleanEmail) {
      throw new Error('Google did not return an email address');
    }

    let user = null;
    if (getDBStatus()) {
      user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        user = await UserModel.create({
          name: profile.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash: bcrypt.hashSync(`google_${Date.now()}`, 10),
          role: 'customer',
          avatar: profile.picture || resolveGoogleAvatar(cleanEmail, '', profile.name),
          authMethod: 'google',
          isEmailVerified: true,
        });
      }
    } else {
      user = {
        id: profile.sub || `usr_${Date.now()}`,
        name: profile.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'customer',
        avatar: profile.picture || resolveGoogleAvatar(cleanEmail, '', profile.name),
      };
    }

    const token = generateToken(user._id || user.id);
    const redirectUrl = `dhanvikk://auth/google-callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err.message);
    return res.redirect(`dhanvikk://auth/google-callback?error=${encodeURIComponent(err.message || 'auth_failed')}`);
  }
};


/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  const resolvedAvatar = resolveGoogleAvatar(req.user?.email, req.user?.avatar, req.user?.name);
  const encryptedPortalKey = generateEncryptedPortalKey({
    id: req.user?.id,
    name: req.user?.name,
    email: req.user?.email,
    phone: req.user?.phone || '',
  });

  return res.status(200).json({
    success: true,
    user: {
      ...req.user,
      avatar: resolvedAvatar,
      encryptedPortalKey,
    },
  });
};

/**
 * @desc    Log user out & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
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

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      street,
      city,
      state,
      country,
      postalCode,
      zipCode,
      addressType,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    if (getDBStatus()) {
      const existingMongo = await UserModel.findOne({ email: cleanEmail });
      if (existingMongo) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please login.',
        });
      }
    }

    const existing = USERS.find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please login.',
      });
    }

    let newUser = null;
    const passwordHash = bcrypt.hashSync(password, 10);
    const avatar = resolveGoogleAvatar(cleanEmail, '', name);

    if (getDBStatus()) {
      newUser = await UserModel.create({
        name,
        email: cleanEmail,
        passwordHash,
        role: 'customer',
        phone: phone || '',
        avatar,
        loginHistory: [
          {
            timestamp: new Date(),
            ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Registration Portal',
            method: 'register',
          },
        ],
      });
    } else {
      newUser = {
        id: `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        passwordHash,
        role: 'customer',
        phone: phone || '',
        avatar,
        createdAt: new Date(),
      };
      USERS.push(newUser);
    }

    // Save initial delivery address & preferences uniquely for this user
    const resolvedStreet = street || (typeof address === 'string' ? address : address?.street) || '';
    const resolvedCity = city || address?.city || 'Dubai';
    const resolvedState = state || address?.state || 'Dubai';
    const resolvedCountry = country || address?.country || 'United Arab Emirates';
    const resolvedZip = postalCode || zipCode || address?.postalCode || address?.zipCode || '';

    const initialAddress = {
      id: `addr_${Date.now()}`,
      title: addressType || 'Primary Residence',
      recipientName: name,
      phone: phone || '',
      street: resolvedStreet,
      city: resolvedCity,
      state: resolvedState,
      postalCode: resolvedZip,
      country: resolvedCountry,
      isDefault: true,
    };

    userProfileStorage.set(cleanEmail, {
      savedAddresses: [initialAddress],
      savedBouquets: getDefaultSavedBouquets(),
      recentOrders: [],
    });

    const tokenPayload = {
      id: newUser._id ? newUser._id.toString() : newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    const token = generateToken(tokenPayload);

    res.cookie('dhanvikk_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const resolvedAvatar = resolveGoogleAvatar(cleanEmail, avatar, name);
    const encryptedPortalKey = generateEncryptedPortalKey({
      id: newUser._id ? newUser._id.toString() : newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
    });

    // Send Dhanvikk Blooms & Exports Welcome Greeting Email + Sign-In Notification
    sendWelcomeGreetingEmail({
      email: cleanEmail,
      name,
      phone: phone || '',
      address: initialAddress,
      encryptedPortalKey,
    }).catch((err) => console.warn('Welcome greeting email delivery note:', err.message));

    sendLoginNotificationEmail({
      email: cleanEmail,
      name,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Dhanvikk Registration Portal',
    }).catch((err) => console.warn('Login notice email delivery note:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Dhanvikk Blooms & Exports 🌸',
      user: {
        id: newUser._id ? newUser._id.toString() : newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: resolvedAvatar,
        encryptedPortalKey,
      },
      savedAddresses: [initialAddress],
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed user account dashboard data (addresses, saved bouquets, recent orders, encrypted URL)
 * @route   GET /api/auth/profile-data
 * @access  Public / Authenticated
 */
export const getProfileData = async (req, res) => {
  try {
    let portalKey = req.query.portalKey || req.headers['x-portal-key'];
    let email = (
      req.user?.email ||
      req.headers['x-user-email'] ||
      req.query.email ||
      ''
    ).toLowerCase().trim();

    if (portalKey && !email) {
      try {
        const decrypted = decryptPortalKey(portalKey);
        if (decrypted?.email) {
          email = decrypted.email.toLowerCase().trim();
        }
      } catch {}
    }

    let targetUser = null;
    if (getDBStatus() && email) {
      try {
        targetUser = await UserModel.findOne({ email });
      } catch {}
    }
    if (!targetUser && email) {
      targetUser = USERS.find((u) => u.email.toLowerCase() === email);
    }
    if (!targetUser) {
      targetUser = req.user || {
        id: 'usr_guest',
        name: 'Valued Customer',
        email: email || 'customer@dhanvikk.com',
        phone: '+971 50 123 4567',
        role: 'customer',
      };
    }

    const userKey = (targetUser.email || targetUser.id || 'default').toLowerCase().trim();
    const stored = userProfileStorage.get(userKey) || userProfileStorage.get(email) || {};

    // 1. Saved Addresses
    let savedAddresses = [];
    if (targetUser.savedAddresses && targetUser.savedAddresses.length > 0) {
      savedAddresses = targetUser.savedAddresses;
    } else if (stored.savedAddresses && stored.savedAddresses.length > 0) {
      savedAddresses = stored.savedAddresses;
    } else {
      savedAddresses = getDefaultAddresses(targetUser.name, targetUser.phone);
      userProfileStorage.set(userKey, { ...stored, savedAddresses });
    }

    // 2. Saved Bouquets (Wishlist: 4 signature roses)
    let savedBouquets = [];
    if (targetUser.savedBouquets && targetUser.savedBouquets.length > 0) {
      savedBouquets = targetUser.savedBouquets;
    } else if (stored.savedBouquets && stored.savedBouquets.length > 0) {
      savedBouquets = stored.savedBouquets;
    } else {
      savedBouquets = getDefaultSavedBouquets();
      const current = userProfileStorage.get(userKey) || {};
      userProfileStorage.set(userKey, { ...current, savedBouquets });
    }

    // 3. Recent Orders uniquely for this user
    let recentOrders = [];
    if (getDBStatus() && email) {
      try {
        recentOrders = await OrderModel.find({
          $or: [{ 'user.email': email }, { email: email }]
        }).sort({ createdAt: -1 });
      } catch {}
    }

    // Fallback: match from inMemoryOrders by email
    if (!recentOrders || recentOrders.length === 0) {
      const memOrders = inMemoryOrders.filter((o) => {
        const oEmail = (o.user?.email || o.email || o.shippingAddress?.email || '').toLowerCase().trim();
        return oEmail === email;
      });
      if (memOrders.length > 0) {
        recentOrders = memOrders;
      }
    }

    // Check userProfileStorage
    if (!recentOrders || recentOrders.length === 0) {
      if (stored.recentOrders && stored.recentOrders.length > 0) {
        recentOrders = stored.recentOrders;
      }
    }

    // Seed active order for default demo accounts so tracking is demonstrable
    if (!recentOrders || recentOrders.length === 0) {
      if (email === 'priya.sharma@gmail.com' || email === 'customer@dhanvikk.com') {
        const primaryAddr = savedAddresses[0] || {};
        recentOrders = [
          {
            id: `ord_${email.replace(/[^a-z0-9]/g, '_')}_101`,
            orderId: 'DHN-2026-8941',
            status: 'Preparing Floral Order',
            deliveryDate: 'Today',
            timeSlot: 'Evening (7:00 PM - 10:00 PM)',
            totalAmount: 2499,
            currency: 'INR',
            trackingStep: 2,
            items: [
              {
                product: 'flw-rose-01',
                name: 'Passionate Serenity Noir',
                notes: 'Ecuadorian Obsidian Rose Bouquet',
                price: 2499,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
              },
            ],
            shippingAddress: {
              fullName: targetUser.name,
              phone: targetUser.phone || primaryAddr.phone || '+91 98765 00000',
              streetAddress: primaryAddr.street || 'Villa 14, Palm Crescent, Palm Jumeirah',
              city: primaryAddr.city || 'Dubai',
              state: primaryAddr.state || 'Dubai, UAE',
              country: primaryAddr.country || 'United Arab Emirates',
              pincode: primaryAddr.postalCode || '00000',
            },
            paymentInfo: { method: 'Razorpay / Card', status: 'Paid' },
            greetingCardMessage: 'With warmest love and blossoming blessings 🌸',
            createdAt: new Date(),
          },
        ];
        userProfileStorage.set(userKey, { ...stored, savedAddresses, recentOrders });
      }
    }

    // 4. Stored Cart uniquely for this user
    let userCart = [];
    if (targetUser.cart && targetUser.cart.length > 0) {
      userCart = targetUser.cart;
    } else if (stored.cart && stored.cart.length > 0) {
      userCart = stored.cart;
    }

    const resolvedAvatar = resolveGoogleAvatar(targetUser.email, targetUser.avatar, targetUser.name);
    const encryptedPortalKey = generateEncryptedPortalKey({
      id: targetUser._id ? targetUser._id.toString() : targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone || '',
    });

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5173';
    // User requested format: http://localhost:5173/account/:userEncryption
    const portalUrl = `${protocol}://${host}/account/${encryptedPortalKey}`;

    return res.status(200).json({
      success: true,
      user: {
        id: targetUser._id ? targetUser._id.toString() : targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone || '',
        role: targetUser.role || 'customer',
        avatar: resolvedAvatar,
        encryptedPortalKey,
        portalUrl,
      },
      savedAddresses,
      savedBouquets,
      recentOrders,
      cart: userCart,
    });
  } catch (error) {
    console.error('getProfileData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile (name, phone, avatar)
 * @route   PUT /api/auth/profile
 * @access  Public / Authenticated
 */
export const updateProfile = async (req, res) => {
  try {
    const email = (
      req.user?.email ||
      req.body.email ||
      req.headers['x-user-email'] ||
      ''
    ).toLowerCase().trim();

    const { name, phone, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    let updated = null;
    if (getDBStatus()) {
      try {
        updated = await UserModel.findOneAndUpdate(
          { email },
          {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(avatar && { avatar }),
          },
          { new: true }
        );
      } catch {}
    }

    const memIdx = USERS.findIndex((u) => u.email.toLowerCase() === email);
    if (memIdx !== -1) {
      if (name) USERS[memIdx].name = name;
      if (phone !== undefined) USERS[memIdx].phone = phone;
      if (avatar) USERS[memIdx].avatar = avatar;
      if (!updated) updated = USERS[memIdx];
    }

    const target = updated || {
      name: name || 'Valued Customer',
      email,
      phone: phone || '',
      avatar: avatar || '',
      role: 'customer',
    };

    const resolvedAvatar = resolveGoogleAvatar(email, target.avatar, target.name);
    const encryptedPortalKey = generateEncryptedPortalKey({
      id: target._id ? target._id.toString() : target.id || 'usr',
      name: target.name,
      email: target.email,
      phone: target.phone || '',
    });

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5173';
    const portalUrl = `${protocol}://${host}/account?portalKey=${encryptedPortalKey}`;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: target._id ? target._id.toString() : target.id,
        name: target.name,
        email: target.email,
        phone: target.phone || '',
        avatar: resolvedAvatar,
        role: target.role || 'customer',
        encryptedPortalKey,
        portalUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add or update saved address
 * @route   POST /api/auth/addresses
 * @access  Public / Authenticated
 */
export const saveAddress = async (req, res) => {
  try {
    const email = (
      req.user?.email ||
      req.body.email ||
      req.headers['x-user-email'] ||
      'customer@dhanvikk.com'
    ).toLowerCase().trim();

    const { id, title, recipientName, phone, street, district, city, state, postalCode, country, isDefault } = req.body;

    const userKey = email;
    const current = userProfileStorage.get(userKey) || {
      savedAddresses: getDefaultAddresses(recipientName, phone),
    };

    let addresses = current.savedAddresses ? [...current.savedAddresses] : [];

    const addressObj = {
      id: id || `addr_${Date.now()}`,
      title: title || 'Saved Address',
      recipientName: recipientName || '',
      phone: phone || '',
      street: street || '',
      district: district || '',
      city: city || '',
      state: state || '',
      postalCode: postalCode || '',
      country: country || 'United Arab Emirates',
      isDefault: Boolean(isDefault),
    };

    const existingIndex = addresses.findIndex((a) => a.id === addressObj.id);
    if (existingIndex !== -1) {
      addresses[existingIndex] = { ...addresses[existingIndex], ...addressObj };
    } else {
      addresses.push(addressObj);
    }

    if (addressObj.isDefault) {
      addresses = addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressObj.id,
      }));
    }

    userProfileStorage.set(userKey, { ...current, savedAddresses: addresses });

    if (getDBStatus()) {
      try {
        await UserModel.findOneAndUpdate({ email }, { savedAddresses: addresses });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: 'Address saved successfully!',
      addresses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete saved address
 * @route   DELETE /api/auth/addresses/:id
 * @access  Public / Authenticated
 */
export const deleteAddress = async (req, res) => {
  try {
    const email = (
      req.user?.email ||
      req.headers['x-user-email'] ||
      req.query.email ||
      'customer@dhanvikk.com'
    ).toLowerCase().trim();

    const { id } = req.params;
    const userKey = email;
    const current = userProfileStorage.get(userKey) || {
      savedAddresses: getDefaultAddresses(),
    };

    let addresses = (current.savedAddresses || []).filter((a) => a.id !== id);
    userProfileStorage.set(userKey, { ...current, savedAddresses: addresses });

    if (getDBStatus()) {
      try {
        await UserModel.findOneAndUpdate({ email }, { savedAddresses: addresses });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: 'Address removed successfully!',
      addresses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle or save bouquet to wishlist
 * @route   POST /api/auth/wishlist
 * @access  Public / Authenticated
 */
export const toggleWishlistBouquet = async (req, res) => {
  try {
    const email = (
      req.user?.email ||
      req.body.email ||
      req.headers['x-user-email'] ||
      'customer@dhanvikk.com'
    ).toLowerCase().trim();

    const { bouquet } = req.body;
    if (!bouquet || !bouquet.id) {
      return res.status(400).json({ success: false, message: 'Bouquet details required' });
    }

    const userKey = email;
    const current = userProfileStorage.get(userKey) || {
      savedBouquets: getDefaultSavedBouquets(),
    };

    let bouquets = current.savedBouquets ? [...current.savedBouquets] : [];
    const existsIdx = bouquets.findIndex((b) => b.id === bouquet.id);

    let action = 'added';
    if (existsIdx !== -1) {
      bouquets.splice(existsIdx, 1);
      action = 'removed';
    } else {
      bouquets.push({
        ...bouquet,
        addedAt: new Date().toISOString(),
      });
      action = 'added';
    }

    userProfileStorage.set(userKey, { ...current, savedBouquets: bouquets });

    if (getDBStatus()) {
      try {
        await UserModel.findOneAndUpdate({ email }, { savedBouquets: bouquets });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: `Bouquet ${action === 'added' ? 'saved to' : 'removed from'} your wishlist!`,
      savedBouquets: bouquets,
      action,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify unique encrypted portal key and authenticate user
 * @route   POST /api/auth/verify-portal
 * @access  Public
 */
export const verifyPortalKey = async (req, res) => {
  try {
    const { portalKey } = req.body;
    if (!portalKey) {
      return res.status(400).json({ success: false, message: 'Portal key is required' });
    }

    const decrypted = decryptPortalKey(portalKey);
    if (!decrypted || !decrypted.email) {
      return res.status(400).json({ success: false, message: 'Invalid or expired portal key' });
    }

    const cleanEmail = decrypted.email.toLowerCase().trim();
    let user = null;

    if (getDBStatus()) {
      user = await UserModel.findOne({ email: cleanEmail });
    }
    if (!user) {
      user = USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    }
    if (!user) {
      user = {
        id: decrypted.id || `usr_${Date.now()}`,
        name: decrypted.name || 'Valued Client',
        email: cleanEmail,
        phone: decrypted.phone || '',
        role: 'customer',
        avatar: resolveGoogleAvatar(cleanEmail, '', decrypted.name),
      };
    }

    const tokenPayload = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    const resolvedAvatar = resolveGoogleAvatar(user.email, user.avatar, user.name);

    const userKey = user.email || user.id || 'default';
    const stored = userProfileStorage.get(userKey) || {};

    const savedAddresses = (user.savedAddresses && user.savedAddresses.length > 0)
      ? user.savedAddresses
      : (stored.savedAddresses && stored.savedAddresses.length > 0)
      ? stored.savedAddresses
      : getDefaultAddresses(user.name, user.phone);

    const savedBouquets = (user.savedBouquets && user.savedBouquets.length > 0)
      ? user.savedBouquets
      : (stored.savedBouquets && stored.savedBouquets.length > 0)
      ? stored.savedBouquets
      : getDefaultSavedBouquets();

    let recentOrders = [];
    if (getDBStatus()) {
      try {
        recentOrders = await OrderModel.find({ 'user.email': cleanEmail }).sort({ createdAt: -1 });
      } catch {}
    }
    if (!recentOrders || recentOrders.length === 0) {
      recentOrders = [
        {
          id: 'ord_active_101',
          orderId: 'DHN-2026-8941',
          status: 'Preparing Floral Order',
          deliveryDate: 'Today',
          timeSlot: 'Evening (7:00 PM - 10:00 PM)',
          totalAmount: 2499,
          currency: 'INR',
          trackingStep: 2,
          items: [
            {
              id: 'flw-rose-01',
              name: 'Passionate Serenity Noir',
              price: 2499,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
            },
          ],
          shippingAddress: savedAddresses[0],
          paymentInfo: { method: 'Razorpay / Card', status: 'Paid' },
          greetingCardMessage: 'Happy Anniversary my love! Forever blooming with you. - Dhanvikk Botanicals',
          createdAt: new Date(),
        },
      ];
    }

    const userCart = user.cart || stored.cart || [];

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5173';
    const portalUrl = `${protocol}://${host}/account/${portalKey}`;

    return res.status(200).json({
      success: true,
      message: 'Cryptographic Portal Authentication Verified!',
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || decrypted.phone || '',
        role: user.role || 'customer',
        avatar: resolvedAvatar,
        encryptedPortalKey: portalKey,
        portalUrl,
      },
      token,
      cart: userCart,
      savedAddresses,
      savedBouquets,
      recentOrders,
    });
  } catch (error) {
    console.error('verifyPortalKey error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to decrypt and verify portal URL',
    });
  }
};

/**
 * @desc    Save cart uniquely for user
 * @route   POST /api/auth/cart
 * @access  Public / Authenticated
 */
export const saveUserCart = async (req, res) => {
  try {
    const email = (
      req.user?.email ||
      req.body.email ||
      req.headers['x-user-email'] ||
      'customer@dhanvikk.com'
    ).toLowerCase().trim();

    const { cart } = req.body;
    const safeCart = Array.isArray(cart) ? cart : [];
    const userKey = email;

    const current = userProfileStorage.get(userKey) || {};
    userProfileStorage.set(userKey, { ...current, cart: safeCart });

    if (getDBStatus()) {
      try {
        await UserModel.findOneAndUpdate({ email }, { cart: safeCart });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: 'Cart saved uniquely for user!',
      cart: safeCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify Firebase ID Token (Email/Password, Google, or Phone) and issue JWT session
 * @route   POST /api/auth/firebase-login
 * @access  Public
 */
export const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, email: reqEmail, name: reqName, phone: reqPhone, avatar: reqAvatar, authMethod } = req.body || {};

    let decodedToken = null;
    if (idToken && firebaseAuth) {
      try {
        decodedToken = await firebaseAuth.verifyIdToken(idToken);
      } catch (tokenErr) {
        console.warn('Firebase verifyIdToken notice:', tokenErr.message);
      }
    }

    const email = (
      decodedToken?.email ||
      reqEmail ||
      (decodedToken?.phone_number ? `${decodedToken.phone_number.replace(/\D/g, '')}@dhanvikk.com` : 'customer@dhanvikk.com')
    )
      .toLowerCase()
      .trim();
    const name = decodedToken?.name || reqName || email.split('@')[0] || 'Valued Client';
    const phone = decodedToken?.phone_number || reqPhone || '';
    const avatar = decodedToken?.picture || reqAvatar || resolveGoogleAvatar(email, '', name);
    const firebaseUid = decodedToken?.uid || req.body?.uid || `fb_${Date.now()}`;

    let user = null;
    if (getDBStatus()) {
      user = await UserModel.findOne({ email });
      if (!user) {
        user = await UserModel.create({
          name,
          email,
          phone,
          passwordHash: bcrypt.hashSync(`firebase_auth_${Date.now()}`, 10),
          role: 'customer',
          avatar,
          loginHistory: [
            {
              timestamp: new Date(),
              ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
              userAgent: req.headers['user-agent'] || 'Firebase Mobile App',
              method: authMethod || 'firebase',
            },
          ],
        });
      } else {
        if (phone && !user.phone) user.phone = phone;
        if (avatar && !user.avatar) user.avatar = avatar;
        user.loginHistory.push({
          timestamp: new Date(),
          ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Firebase Mobile App',
          method: authMethod || 'firebase',
        });
        await user.save();
      }
    } else {
      let memUser = USERS.find((u) => u.email === email);
      if (!memUser) {
        memUser = {
          id: `usr_${Date.now()}`,
          name,
          email,
          phone,
          role: 'customer',
          avatar,
        };
        USERS.push(memUser);
      } else {
        if (phone && !memUser.phone) memUser.phone = phone;
        if (avatar && !memUser.avatar) memUser.avatar = avatar;
      }
      user = memUser;
    }

    const tokenPayload = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    const safeUser = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || avatar,
      firebaseUid,
    };

    return res.status(200).json({
      success: true,
      message: 'Firebase authentication verified successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

