import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { firebaseAuth } from '../config/firebaseAdmin.js';
import { generateEncryptedPortalKey } from '../utils/cryptoUtil.js';
import { sendLoginNotificationEmail, sendWelcomeGreetingEmail } from './emailService.js';
import { ApiError } from '../utils/apiError.js';
import { USERS } from '../data/users.js';
import { getDBStatus } from '../config/db.js';

// In-memory registry for seamless offline/hybrid operation
export const inMemoryUsers = new Map();

// Initialize inMemoryUsers with seed USERS
USERS.forEach((u) => {
  inMemoryUsers.set(u.email.toLowerCase(), {
    ...u,
    _id: u.id,
    savedAddresses: u.savedAddresses || [],
    savedBouquets: u.savedBouquets || [],
    cart: u.cart || [],
    loginHistory: u.loginHistory || [],
  });
});

/**
 * Resolves user role based on configured super admin / admin emails or existing role
 */
export const resolveUserRole = (email = '', currentRole = 'customer') => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const superAdmin = (process.env.SUPER_ADMIN_EMAIL || 'divagar.m.msc.cs@gmail.com').toLowerCase().trim();
  if (cleanEmail === superAdmin || cleanEmail === 'admin@dhanvikk.com') {
    return 'admin';
  }
  if (cleanEmail === 'manager@dhanvikk.com') {
    return 'manager';
  }
  return currentRole || 'customer';
};

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
  if (getDBStatus()) {
    try {
      let user = await UserModel.findOne({ email: cleanEmail });
      if (user) return user;

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
    } catch (err) {
      console.warn('MongoDB ensureUserInDB fallback:', err.message);
    }
  }

  // Memory fallback
  const seed = USERS.find((u) => u.email === cleanEmail);
  if (seed) {
    const memoryUser = {
      ...seed,
      _id: seed.id,
      savedAddresses: [],
      savedBouquets: [],
      cart: [],
      loginHistory: [],
    };
    inMemoryUsers.set(cleanEmail, memoryUser);
    return memoryUser;
  }

  return inMemoryUsers.get(cleanEmail) || null;
};

export const loginWithEmailPassword = async ({ email, password, ip = '127.0.0.1', userAgent = '' }) => {
  const cleanEmail = email.trim().toLowerCase();
  let user = null;

  if (getDBStatus()) {
    try {
      user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        user = await ensureUserInDB(cleanEmail, password);
      }
    } catch (err) {
      console.warn('MongoDB login lookup fallback:', err.message);
    }
  }

  // In-memory fallback
  if (!user) {
    user = inMemoryUsers.get(cleanEmail);
    if (!user) {
      user = await ensureUserInDB(cleanEmail, password);
    }
  }

  if (!user) {
    throw new ApiError(404, 'Account not found with this email. Please register to create your account.');
  }

  // Password verification with demo fallback allowances
  const isMatch =
    (user.passwordHash && bcrypt.compareSync(password, user.passwordHash)) ||
    (cleanEmail === 'customer@dhanvikk.com' && (password === 'password123' || password === 'Bloom@2026')) ||
    (cleanEmail === 'admin@dhanvikk.com' && password === 'AdminBloom@2026') ||
    (cleanEmail === 'manager@dhanvikk.com' && password === 'Manager@2026');

  if (!isMatch) {
    throw new ApiError(401, 'Incorrect password. Please try again.');
  }

  // Update login history
  if (typeof user.save === 'function') {
    try {
      user.loginHistory.push({
        timestamp: new Date(),
        ip,
        userAgent,
        method: 'email',
      });
      await user.save();
    } catch {}
  }

  const userId = (user._id || user.id || 'usr_cust').toString();
  const tokenPayload = {
    id: userId,
    name: user.name,
    email: user.email,
    role: user.role || 'customer',
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

  if (getDBStatus()) {
    try {
      const existingUser = await UserModel.findOne({ email: cleanEmail });
      if (existingUser) {
        throw new ApiError(409, 'An account with this email address already exists. Please login.');
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn('MongoDB register check fallback:', err.message);
    }
  }

  if (inMemoryUsers.has(cleanEmail)) {
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

  let newUser = null;

  if (getDBStatus()) {
    try {
      newUser = await UserModel.create({
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
    } catch (err) {
      console.warn('MongoDB user create fallback:', err.message);
    }
  }

  if (!newUser) {
    const memId = `usr_${Date.now()}`;
    newUser = {
      _id: memId,
      id: memId,
      name,
      email: cleanEmail,
      passwordHash,
      role: 'customer',
      phone: phone || '',
      avatar,
      savedAddresses: initialAddresses,
      savedBouquets: [],
      cart: [],
      loginHistory: [
        {
          timestamp: new Date(),
          ip,
          userAgent,
          method: 'register',
        },
      ],
    };
    inMemoryUsers.set(cleanEmail, newUser);
  }

  const tokenPayload = {
    id: (newUser._id || newUser.id).toString(),
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

  let user = null;
  let isNew = false;
  const initialRole = resolveUserRole(email);

  if (getDBStatus()) {
    try {
      user = await UserModel.findOne({ email });
      if (!user) {
        isNew = true;
        user = await UserModel.create({
          name,
          email,
          phone,
          passwordHash: bcrypt.hashSync(`firebase_${Date.now()}`, 10),
          role: initialRole,
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
        const expectedRole = resolveUserRole(email, user.role);
        if (user.role !== expectedRole) user.role = expectedRole;
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
    } catch (err) {
      console.warn('MongoDB loginWithFirebase fallback:', err.message);
    }
  }

  if (!user) {
    user = inMemoryUsers.get(email);
    if (!user) {
      isNew = true;
      const memId = `fb_usr_${Date.now()}`;
      user = {
        _id: memId,
        id: memId,
        name,
        email,
        phone,
        passwordHash: bcrypt.hashSync(`firebase_${Date.now()}`, 10),
        role: initialRole,
        avatar,
        savedAddresses: [],
        savedBouquets: [],
        cart: [],
        loginHistory: [
          {
            timestamp: new Date(),
            ip,
            userAgent,
            method: authMethod,
          },
        ],
      };
      inMemoryUsers.set(email, user);
    } else {
      const expectedRole = resolveUserRole(email, user.role);
      user.role = expectedRole;
      inMemoryUsers.set(email, user);
    }
  }

  const tokenPayload = {
    id: (user._id || user.id).toString(),
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

  let user = null;
  let isCreated = false;
  const initialGoogleRole = resolveUserRole(targetEmail);

  if (getDBStatus()) {
    try {
      user = await UserModel.findOne({ email: targetEmail });
      if (!user) {
        isCreated = true;
        user = await UserModel.create({
          name: targetName,
          email: targetEmail,
          phone,
          passwordHash: bcrypt.hashSync(`google_${Date.now()}`, 10),
          role: initialGoogleRole,
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
        const expectedRole = resolveUserRole(targetEmail, user.role);
        if (user.role !== expectedRole) user.role = expectedRole;
        if (phone && !user.phone) user.phone = phone;
        user.loginHistory.push({
          timestamp: new Date(),
          ip,
          userAgent,
          method: 'google',
        });
        await user.save();
      }
    } catch (err) {
      console.warn('MongoDB Google login fallback:', err.message);
    }
  }

  if (!user) {
    user = inMemoryUsers.get(targetEmail);
    if (!user) {
      isCreated = true;
      const memId = `google_usr_${Date.now()}`;
      user = {
        _id: memId,
        id: memId,
        name: targetName,
        email: targetEmail,
        phone,
        passwordHash: bcrypt.hashSync(`google_${Date.now()}`, 10),
        role: initialGoogleRole,
        avatar: targetAvatar,
        savedAddresses: [],
        savedBouquets: [],
        cart: [],
        loginHistory: [
          {
            timestamp: new Date(),
            ip,
            userAgent,
            method: 'google',
          },
        ],
      };
      inMemoryUsers.set(targetEmail, user);
    } else {
      const expectedRole = resolveUserRole(targetEmail, user.role);
      user.role = expectedRole;
      inMemoryUsers.set(targetEmail, user);
    }
  }

  const tokenPayload = {
    id: (user._id || user.id).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(tokenPayload);

  let firebaseCustomToken = null;
  if (firebaseAuth) {
    try {
      firebaseCustomToken = await firebaseAuth.createCustomToken((user._id || user.id).toString(), {
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

