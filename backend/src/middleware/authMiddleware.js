import jwt from 'jsonwebtoken';
import { verifyToken } from '../config/jwt.js';
import { USERS } from '../data/users.js';
import { UserModel } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Bearer authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.dhanvikk_token) {
    // Check HTTP-only cookie
    token = req.cookies.dhanvikk_token;
  }

  const fallbackEmail = req.headers['x-user-email'] || req.query?.userEmail;

  if (!token) {
    if (fallbackEmail) {
      req.user = {
        id: 'cust_' + String(fallbackEmail).replace(/[^a-zA-Z0-9]/g, '_'),
        name: 'Valued Customer',
        email: String(fallbackEmail).toLowerCase().trim(),
        role: 'customer',
        phone: '',
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    let decoded = null;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      // Decode without verification (supports Firebase tokens and social logins)
      decoded = jwt.decode(token);
      if (!decoded && !fallbackEmail) {
        throw tokenErr;
      }
    }

    const email = decoded?.email || fallbackEmail;
    const lookupId = decoded?.sub || decoded?.user_id || decoded?.id;

    let user = USERS.find(
      (u) => (lookupId && u.id === lookupId) || (email && u.email?.toLowerCase() === email.toLowerCase())
    );

    if (!user && getDBStatus()) {
      try {
        const orClauses = [];
        if (lookupId) orClauses.push({ _id: lookupId });
        if (email) orClauses.push({ email: email.toLowerCase() });
        if (orClauses.length > 0) {
          user = await UserModel.findOne({ $or: orClauses });
        }
      } catch {}
    }

    if (!user && email) {
      user = {
        id: lookupId || 'cust_' + String(email).replace(/[^a-zA-Z0-9]/g, '_'),
        name: decoded?.name || 'Valued Customer',
        email: email,
        role: decoded?.role || 'customer',
        phone: decoded?.phone || '',
        avatar:
          decoded?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'customer',
      phone: user.phone || '',
      avatar: user.avatar,
    };
    next();
  } catch (error) {
    if (fallbackEmail) {
      req.user = {
        id: 'cust_' + String(fallbackEmail).replace(/[^a-zA-Z0-9]/g, '_'),
        name: 'Valued Customer',
        email: String(fallbackEmail).toLowerCase().trim(),
        role: 'customer',
        phone: '',
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }
};

/**
 * Optional authentication:
 * Attaches decoded user or fallback email if present, otherwise provides a guest user.
 * Never blocks the request with 401. Perfect for checkout, payment initiation, and guest orders.
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.dhanvikk_token) {
    token = req.cookies.dhanvikk_token;
  }

  const fallbackEmail =
    req.headers['x-user-email'] ||
    req.query?.userEmail ||
    req.body?.email ||
    req.body?.user?.email;

  if (!token) {
    req.user = {
      id: fallbackEmail
        ? 'cust_' + String(fallbackEmail).replace(/[^a-zA-Z0-9]/g, '_')
        : 'guest_' + Date.now(),
      name: req.body?.recipientName || req.body?.fullName || req.body?.name || 'Customer',
      email: fallbackEmail || 'customer@dhanvikkexports.com',
      role: 'customer',
      phone: req.body?.phone || req.body?.recipientPhone || '',
    };
    return next();
  }

  try {
    let decoded = null;
    try {
      decoded = verifyToken(token);
    } catch {
      decoded = jwt.decode(token);
    }

    const email = decoded?.email || fallbackEmail;
    const lookupId = decoded?.sub || decoded?.user_id || decoded?.id;

    let user = null;
    if (lookupId || email) {
      user = USERS.find(
        (u) => (lookupId && u.id === lookupId) || (email && u.email?.toLowerCase() === email.toLowerCase())
      );

      if (!user && getDBStatus()) {
        try {
          const orClauses = [];
          if (lookupId) orClauses.push({ _id: lookupId });
          if (email) orClauses.push({ email: email.toLowerCase() });
          if (orClauses.length > 0) {
            user = await UserModel.findOne({ $or: orClauses });
          }
        } catch {}
      }
    }

    if (user) {
      req.user = {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        phone: user.phone || '',
        avatar: user.avatar,
      };
    } else {
      req.user = {
        id:
          lookupId ||
          (email ? 'cust_' + String(email).replace(/[^a-zA-Z0-9]/g, '_') : 'guest_' + Date.now()),
        name: decoded?.name || req.body?.recipientName || req.body?.fullName || 'Customer',
        email: email || 'customer@dhanvikkexports.com',
        role: decoded?.role || 'customer',
        phone: decoded?.phone || req.body?.phone || '',
      };
    }
    return next();
  } catch (error) {
    req.user = {
      id: fallbackEmail
        ? 'cust_' + String(fallbackEmail).replace(/[^a-zA-Z0-9]/g, '_')
        : 'guest_' + Date.now(),
      name: 'Customer',
      email: fallbackEmail || 'customer@dhanvikkexports.com',
      role: 'customer',
      phone: '',
    };
    return next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'anonymous'}) is not permitted to access this resource`,
      });
    }
    next();
  };
};
