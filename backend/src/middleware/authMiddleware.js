import { verifyToken } from '../config/jwt.js';
import { USERS } from '../data/users.js';
import { UserModel } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { inMemoryUsers } from '../services/auth.service.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Bearer authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.dhanvikk_token) {
    // Check HTTP-only cookie
    token = req.cookies.dhanvikk_token;
  }

  // Strict check: Protected endpoints must reject unauthenticated requests
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.',
    });
  }

  try {
    const decoded = verifyToken(token);
    let user = null;

    if (getDBStatus()) {
      try {
        if (decoded.sub && decoded.sub.length === 24) {
          user = await UserModel.findById(decoded.sub);
        }
        if (!user && decoded.email) {
          user = await UserModel.findOne({ email: decoded.email.toLowerCase() });
        }
      } catch (dbErr) {
        console.warn('protect db lookup warning:', dbErr.message);
      }
    }

    if (!user) {
      const emailLower = (decoded.email || '').toLowerCase().trim();
      user = inMemoryUsers.get(emailLower) || USERS.find((u) => u.id === decoded.sub || u.email.toLowerCase() === emailLower);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user account was not found or has been revoked.',
      });
    }

    req.user = {
      _id: user._id,
      id: user._id ? user._id.toString() : (user.id || decoded.sub),
      name: user.name || decoded.name || 'Valued Customer',
      email: (user.email || decoded.email || '').toLowerCase().trim(),
      role: user.role || decoded.role || 'customer',
      phone: user.phone || decoded.phone || '',
      avatar: user.avatar || decoded.avatar || '',
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'unauthenticated'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

