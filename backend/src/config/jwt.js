import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_DEV_SECRET = 'dhanvikk_blooms_super_secure_jwt_secret_2026_xyz';
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_key_12345' : DEFAULT_DEV_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_SECRET)) {
  throw new Error('FATAL: Production deployment requires a secure, non-default JWT_SECRET environment variable.');
}

export const generateToken = (user) => {
  const userId = (user.id || user._id || '').toString();
  const userEmail = (user.email || '').toLowerCase().trim();
  const userRole = user.role || 'customer';

  return jwt.sign(
    {
      sub: userId,
      id: userId,
      email: userEmail,
      name: user.name || 'Valued Customer',
      role: userRole,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('No token provided or invalid format');
  }
  return jwt.verify(token, JWT_SECRET);
};

