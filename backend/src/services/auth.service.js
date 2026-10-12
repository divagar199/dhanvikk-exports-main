import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { firebaseAuth } from '../config/firebaseAdmin.js';
import { generateEncryptedPortalKey } from '../utils/cryptoUtil.js';
import { sendLoginNotificationEmail, sendWelcomeGreetingEmail } from './emailService.js';
import { ApiError } from '../utils/apiError.js';
import { USERS } from '../data/users.js';

/**
 * Resolves avatar URL with high-res Google or UI-Avatar fallback
 */
export const resolveGoogleAvatar = (email = '', currentAvatar = '', name = '') => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (
    currentAvatar &&
    (currentAvatar.includes('googleusercontent.com') ||
      currentAvatar.includes('cloudinary') ||
      currentAvatar.includes('unsplash') ||
      currentAvatar.startsWith('data:'))
  ) {
    return currentAvatar;
  }
  if (cleanEmail.endsWith('@gmail.com') || cleanEmail.includes('google')) {
    return `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}?fallback=${encodeURIComponent(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail.split('@')[0])}&background=800020&color=d4af37&bold=true&size=256`
    )}`;
  }
  return (
    currentAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Customer')}&background=800020&color=d4af37&bold=true&size=256`
  );
};

/**
 * Strips sensitive fields and formats user profile for client
 */
export const formatUserResponse = (user) => {
  const email = user.email || '';
  const name = user.name || email.split('@')[0] || 'Valued Client';
  const resolvedAvatar = resolveGoogleAvatar(email, user.avatar, name);
  const id = user._id ? user._id.toString() : user.id;

  const encryptedPortalKey = generateEncryptedPortalKey({
    id,
    name,
    email,
    phone: user.phone || '',
  });

  return {
    id,
    name,
    email,
    role: user.role || 'customer',
    phone: user.phone || '',
    avatar: resolvedAvatar,
    encryptedPortalKey,
    savedAddresses: user.savedAddresses || [],
    savedBouquets: user.savedBouquets || [],
    cart: user.cart || [],
  };
};

/**
 * Ensures demo user exists in MongoDB database if missing
 */
const ensureUserInDB = async (cleanEmail, password) => {
  let user = await UserModel.findOne({ email: cleanEmail });
  if (user) return user;

  // Check seed USERS if present
  const seed = USERS.find((u) => u.email === cleanEmail);
  if (seed) {
    user = await UserModel.create({
      name: seed.name,
      email: seed.email,
      passwordHash: seed.passwordHash,
      role: seed.role || 'customer',
      phone: seed.phone || '',
      avatar: seed.avatar || resolveGoogleAvatar(seed.email, '', seed.name),
      savedAddresses: seed.savedAddresses || [],
      savedBouquets: seed.savedBouquets || [],
      cart: seed.cart || [],
    });
    return user;
  }

  // Auto-seed default customer if accessing with standard demo password
  if (cleanEmail === 'customer@dhanvikk.com') {
    user = await UserModel.create({
      name: 'Priya Sharma',
      email: cleanEmail,
      passwordHash: bcrypt.hashSync('Bloom@2026', 10),
      role: 'customer',
      phone: '+91 98765 00000',
      avatar: resolveGoogleAvatar(cleanEmail, '', 'Priya Sharma'),
    });
    return user;
  }

  return null;
};

export const loginWithEmailPassword = async ({ email, password, ip = '127.0.0.1', userAgent = '' }) => {
  const cleanEmail = email.trim().toLowerCase();
  let user = await UserModel.findOne({ email: cleanEmail });

  if (!user) {
    user = await ensureUserInDB(cleanEmail, password);
  }

  if (!user) {
    throw new ApiError(404, 'Account not found with this email. Please register to create your account.');
  }

  // Password verification with demo fallback allowances
  const isMatch =
    bcrypt.compareSync(password, user.passwordHash) ||
    (cleanEmail === 'customer@dhanvikk.com' && (password === 'password123' || password === 'Bloom@2026')) ||
    (cleanEmail === 'admin@dhanvikk.com' && password === 'AdminBloom@2026') ||
    (cleanEmail === 'manager@dhanvikk.com' && password === 'Manager@2026');

  if (!isMatch) {
    throw new ApiError(401, 'Incorrect password. Please try again.');
  }

  // Update login history
  user.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
    method: 'email',
  });
  await user.save();

  const tokenPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  // Send asynchronous login email notification
  sendLoginNotificationEmail({
    email: user.email,
    name: user.name,
    ip,
    userAgent,
  }).catch((err) => console.warn('Email notification note:', err.message));

  return {
    user: formatUserResponse(user),
    token,
  };
};

export const registerUser = async ({
  name,
  email,
  password,
  phone = '',
  street = '',
  city = 'Dubai',
  state = 'Dubai',
  country = 'United Arab Emirates',
  postalCode = '',
  zipCode = '',
  addressType = 'Primary Residence',
  address = null,
  ip = '127.0.0.1',
  userAgent = '',
}) => {
  const cleanEmail = email.trim().toLowerCase();
  const existingUser = await UserModel.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists. Please login.');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const avatar = resolveGoogleAvatar(cleanEmail, '', name);

  // Build initial address if provided
  const resolvedStreet = street || (typeof address === 'string' ? address : address?.street) || '';
  const resolvedCity = city || address?.city || 'Dubai';
  const resolvedState = state || address?.state || 'Dubai';
  const resolvedCountry = country || address?.country || 'United Arab Emirates';
  const resolvedZip = postalCode || zipCode || address?.postalCode || address?.zipCode || '';

  const initialAddresses = [];
  if (resolvedStreet) {
    initialAddresses.push({
      id: `addr_${Date.now()}`,
      title: addressType || 'Primary Residence',
      recipientName: name,
      phone: phone || '',
      street: resolvedStreet,
      city: resolvedCity,
      state: resolvedState,
      country: resolvedCountry,
      postalCode: resolvedZip,
      isDefault: true,
    });
  }

  const newUser = await UserModel.create({
    name,
    email: cleanEmail,
    passwordHash,
    role: 'customer',
    phone: phone || '',
    avatar,
    savedAddresses: initialAddresses,
    loginHistory: [
      {
        timestamp: new Date(),
        ip,
        userAgent,
        method: 'register',
      },
    ],
  });

  const tokenPayload = {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
  const token = generateToken(tokenPayload);

  // Welcome email
  sendWelcomeGreetingEmail({
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
    address: initialAddresses[0] || null,
  }).catch((err) => console.warn('Welcome greeting email note:', err.message));

  return {
    user: formatUserResponse(newUser),
    token,
  };
};

export const loginWithFirebase = async ({
  idToken,
  email: reqEmail,
  name: reqName,
  phone: reqPhone,
  avatar: reqAvatar,
  authMethod = 'firebase',
  ip = '127.0.0.1',
  userAgent = '',
}) => {
  let decodedToken = null;
  if (idToken && firebaseAuth) {
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (err) {
      console.warn('Firebase verifyIdToken fallback note:', err.message);
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

  let user = await UserModel.findOne({ email });
  let isNew = false;

  if (!user) {
    isNew = true;
    user = await UserModel.create({
      name,
      email,
      phone,
      passwordHash: bcrypt.hashSync(`firebase_${Date.now()}`, 10),
      role: 'customer',
      avatar,
      loginHistory: [
        {
          timestamp: new Date(),
          ip,
          userAgent,
          method: authMethod,
        },
      ],
    });
  } else {
    if (phone && !user.phone) user.phone = phone;
    if (avatar && !user.avatar) user.avatar = avatar;
    user.loginHistory.push({
      timestamp: new Date(),
      ip,
      userAgent,
      method: authMethod,
    });
    await user.save();
  }

  const tokenPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  return {
    user: formatUserResponse(user),
    token,
    isNew,
  };
};

export const loginWithGooglePayload = async ({
  email,
  name,
  avatar,
  phone = '',
  ip = '127.0.0.1',
  userAgent = '',
  isNewRegistration = false,
}) => {
  const targetEmail = (email || '').toLowerCase().trim();
  if (!targetEmail) {
    throw new ApiError(422, 'Google email is required');
  }

  const targetName = name || targetEmail.split('@')[0] || 'Google Customer';
  const targetAvatar = avatar || resolveGoogleAvatar(targetEmail, '', targetName);

  let user = await UserModel.findOne({ email: targetEmail });
  let isCreated = false;

  if (!user) {
    isCreated = true;
    user = await UserModel.create({
      name: targetName,
      email: targetEmail,
      phone,
      passwordHash: bcrypt.hashSync(`google_${Date.now()}`, 10),
      role: 'customer',
      avatar: targetAvatar,
      loginHistory: [
        {
          timestamp: new Date(),
          ip,
          userAgent,
          method: 'google',
        },
      ],
    });
  } else {
    if (phone && !user.phone) user.phone = phone;
    user.loginHistory.push({
      timestamp: new Date(),
      ip,
      userAgent,
      method: 'google',
    });
    await user.save();
  }

  const tokenPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  let firebaseCustomToken = null;
  if (firebaseAuth) {
    try {
      firebaseCustomToken = await firebaseAuth.createCustomToken(user._id.toString(), {
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch {}
  }

  return {
    user: formatUserResponse(user),
    token,
    firebaseCustomToken,
    isCreated: isCreated || Boolean(isNewRegistration),
  };
};
