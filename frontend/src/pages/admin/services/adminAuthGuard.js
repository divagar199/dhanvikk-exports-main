import { db } from '../../../config/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

// Hardcoded root super-admins for immediate boot protection
export const ROOT_ADMIN_EMAILS = [
  'divagar.m.msc.cs@gmail.com',
  'xzirexatech@gmail.com',
];

const ROLE_HIERARCHY = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
  customer: 0,
  user: 0,
};

/**
 * Checks if user has at least the required role priority
 */
export function hasMinimumRole(userRole, requiredRole) {
  const userRank = ROLE_HIERARCHY[userRole] || 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] || 0;
  return userRank >= requiredRank;
}

/**
 * Checks if user email is authorized as admin
 */
export function isRootAdminEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ROOT_ADMIN_EMAILS.some((e) => e.toLowerCase() === clean);
}

/**
 * Validates admin status against both local root list & Firestore allowlist
 */
export async function verifyAdminStatus(user) {
  if (!user) return { authorized: false, role: 'viewer', isSuperAdmin: false };

  const email = (user.email || '').trim().toLowerCase();
  const isRoot = isRootAdminEmail(email);

  if (isRoot) {
    return { authorized: true, role: ADMIN_ROLES.SUPER_ADMIN, isSuperAdmin: true };
  }

  // Check Firestore adminAllowlist collection
  try {
    if (db) {
      const allowlistRef = doc(db, 'adminAllowlist', email);
      const snap = await Promise.race([
        getDoc(allowlistRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);

      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'Active') {
          return {
            authorized: true,
            role: data.role || ADMIN_ROLES.VIEWER,
            isSuperAdmin: data.role === ADMIN_ROLES.SUPER_ADMIN,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[adminAuthGuard] Remote allowlist check failed, using fallback:', err.message);
  }

  // Check user document role in Firestore or fallback to user.role
  const userRole = user.role || 'customer';
  const hasAdminRole = ['admin', 'manager', 'inventory_manager', 'delivery_manager', 'super_admin'].includes(userRole);

  return {
    authorized: hasAdminRole,
    role: userRole === 'super_admin' ? ADMIN_ROLES.SUPER_ADMIN : (hasAdminRole ? ADMIN_ROLES.ADMIN : 'customer'),
    isSuperAdmin: userRole === 'super_admin',
  };
}

