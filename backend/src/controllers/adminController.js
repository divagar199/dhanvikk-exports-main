import { UserModel } from '../models/User.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { USERS } from '../data/users.js';
import { getDBStatus } from '../config/db.js';

/**
 * @desc Get all registered users and their login history
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    if (getDBStatus()) {
      const users = await UserModel.find({}, '-passwordHash').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, users });
    }

    const safeUsers = USERS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      createdAt: u.createdAt,
      lastLogin: new Date().toISOString(),
    }));

    return res.status(200).json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get Admin Dashboard analytical metrics
 * @route GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    let totalRevenue = 184250;
    let totalOrders = 42;
    let totalUsers = USERS.length;
    let lowStockCount = 3;

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        lowStockCount,
        currency: 'INR',
        activeColdChainDispatches: 8,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
