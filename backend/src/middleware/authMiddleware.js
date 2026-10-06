import { verifyToken } from '../config/jwt.js';
import { USERS } from '../data/users.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Bearer authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.dhanvikk_token) {
    // Check HTTP-only cookie
    token = req.cookies.dhanvikk_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = verifyToken(token);
    let user = USERS.find((u) => u.id === decoded.sub || u.email === decoded.email);

    if (!user && getDBStatus()) {
      try {
        user = await UserModel.findOne({ $or: [{ _id: decoded.sub }, { email: decoded.email }] });
      } catch {}
    }

    if (!user && decoded.email) {
      user = {
        id: decoded.sub,
        name: decoded.name || 'Valued Customer',
        email: decoded.email,
        role: decoded.role || 'customer',
        phone: decoded.phone || '',
        avatar: decoded.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
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
