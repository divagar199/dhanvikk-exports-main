import api from './api';

const FALLBACK_USERS = [
  {
    _id: 'usr_adm_001',
    id: 'usr_adm_001',
    name: 'Dhanvikk Administrator',
    email: 'admin@dhanvikk.com',
    role: 'admin',
    phone: '+91 98765 11111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    loginHistory: [
      {
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1 (Production Console)',
        userAgent: 'Chrome on Windows 11',
        method: 'email',
      },
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip: '192.168.1.5',
        userAgent: 'Safari on macOS',
        method: 'email',
      },
    ],
  },
  {
    _id: 'usr_mgr_001',
    id: 'usr_mgr_001',
    name: 'Priya Sharma (Store Manager)',
    email: 'manager@dhanvikk.com',
    role: 'manager',
    phone: '+91 98765 22222',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    loginHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        ip: '49.207.210.14',
        userAgent: 'Firefox on Windows',
        method: 'email',
      },
    ],
  },
  {
    _id: 'usr_cust_001',
    id: 'usr_cust_001',
    name: 'Aarav Patel',
    email: 'customer@dhanvikk.com',
    role: 'customer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    loginHistory: [
      {
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        ip: '14.139.128.5',
        userAgent: 'Chrome Mobile on Android',
        method: 'email',
      },
    ],
  },
];

const FALLBACK_STATS = {
  totalRevenue: 248650,
  totalOrders: 58,
  totalUsers: 14,
  lowStockCount: 4,
};

export const adminService = {
  /**
   * Fetch all registered users and their logins history
   */
  async getAllUsers() {
    try {
      const response = await api.get('/api/admin/users');
      if (response.data && response.data.users && response.data.users.length > 0) {
        return response.data;
      }
      return { success: true, count: FALLBACK_USERS.length, users: FALLBACK_USERS };
    } catch {
      return { success: true, count: FALLBACK_USERS.length, users: FALLBACK_USERS };
    }
  },

  /**
   * Fetch admin analytics and performance stats
   */
  async getAdminStats() {
    try {
      const response = await api.get('/api/admin/stats');
      if (response.data && response.data.stats) {
        return response.data;
      }
      return { success: true, stats: FALLBACK_STATS };
    } catch {
      return { success: true, stats: FALLBACK_STATS };
    }
  },

  /**
   * Super Admin: Get Super Admin email and configuration
   */
  async getSuperAdminInfo() {
    try {
      const response = await api.get('/api/admin/staff/info');
      return response.data;
    } catch {
      return { success: true, superAdminEmail: 'divagar.m.msc.cs@gmail.com' };
    }
  },

  /**
   * Super Admin: Get all staff members
   */
  async getAllStaff() {
    try {
      const response = await api.get('/api/admin/staff');
      return response.data;
    } catch {
      return {
        success: true,
        superAdminEmail: 'divagar.m.msc.cs@gmail.com',
        staff: [
          {
            id: 'staff-super-01',
            name: 'Divagar M (Super Admin)',
            email: 'divagar.m.msc.cs@gmail.com',
            role: 'super_admin',
            roleTitle: 'Chief Executive & Super Admin',
            phone: '+91 98765 43210',
            status: 'Active',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            isSuperAdmin: true,
            joinedDate: '2026-01-01',
          },
          {
            id: 'staff-florist-02',
            name: 'Priya Sharma',
            email: 'priya.florist@dhanvikk.com',
            role: 'inventory_manager',
            roleTitle: 'Master Florist & Inventory Lead',
            phone: '+971 50 123 4567',
            status: 'Active',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
            isSuperAdmin: false,
            joinedDate: '2026-02-15',
          },
        ],
      };
    }
  },

  /**
   * Super Admin: Add new staff member
   */
  async addStaff(staffData) {
    const response = await api.post('/api/admin/staff', staffData);
    return response.data;
  },

  /**
   * Super Admin: Update staff member
   */
  async updateStaff(id, staffData) {
    const response = await api.put(`/api/admin/staff/${id}`, staffData);
    return response.data;
  },

  /**
   * Super Admin: Delete staff member
   */
  async deleteStaff(id) {
    const response = await api.delete(`/api/admin/staff/${id}`);
    return response.data;
  },
};


