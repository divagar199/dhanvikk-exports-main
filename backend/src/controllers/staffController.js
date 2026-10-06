import { UserModel } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'divagar.m.msc.cs@gmail.com').toLowerCase().trim();

// In-memory staff list (active fallback & memory store)
let inMemoryStaff = [
  {
    id: 'staff-super-01',
    name: 'Divagar M (Super Admin)',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    roleTitle: 'Chief Executive & Super Admin',
    phone: '+91 98765 43210',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    permissions: ['all_access', 'manage_staff', 'manage_products', 'manage_orders', 'view_finances', 'delete_records'],
    joinedDate: '2026-01-01',
    isSuperAdmin: true,
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
    permissions: ['manage_products', 'manage_inventory', 'view_orders'],
    joinedDate: '2026-02-15',
    isSuperAdmin: false,
  },
  {
    id: 'staff-dispatch-03',
    name: 'Rahul Nair',
    email: 'rahul.dispatch@dhanvikk.com',
    role: 'delivery_manager',
    roleTitle: 'Cold-Chain Dispatch Coordinator',
    phone: '+971 55 987 6543',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    permissions: ['manage_orders', 'update_delivery_status'],
    joinedDate: '2026-03-01',
    isSuperAdmin: false,
  },
];

/**
 * @desc Get Super Admin info and verification
 * @route GET /api/admin/staff/info
 */
export const getSuperAdminInfo = async (req, res) => {
  return res.status(200).json({
    success: true,
    superAdminEmail: SUPER_ADMIN_EMAIL,
  });
};

/**
 * @desc Get all staff members
 * @route GET /api/admin/staff
 */
export const getAllStaff = async (req, res) => {
  try {
    let staffList = [...inMemoryStaff];

    if (getDBStatus()) {
      try {
        const dbUsers = await UserModel.find({
          role: { $in: ['admin', 'manager', 'inventory_manager', 'delivery_manager', 'super_admin'] },
        }).select('-passwordHash');

        if (dbUsers && dbUsers.length > 0) {
          // Merge or supplement
          const dbStaff = dbUsers.map((u) => ({
            id: u._id.toString(),
            _id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            roleTitle:
              u.role === 'super_admin'
                ? 'Super Admin'
                : u.role === 'inventory_manager'
                ? 'Master Florist & Inventory'
                : u.role === 'delivery_manager'
                ? 'Dispatch Coordinator'
                : 'Store Administrator',
            phone: u.phone || '',
            status: 'Active',
            avatar: u.avatar,
            isSuperAdmin: u.email.toLowerCase() === SUPER_ADMIN_EMAIL || u.role === 'super_admin',
            joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
          }));

          // Ensure super admin is included at the top
          const hasSuperAdmin = dbStaff.some((s) => s.email.toLowerCase() === SUPER_ADMIN_EMAIL);
          if (!hasSuperAdmin) {
            dbStaff.unshift(inMemoryStaff[0]);
          }
          staffList = dbStaff;
        }
      } catch (dbErr) {
        console.warn('DB Staff query warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: staffList.length,
      superAdminEmail: SUPER_ADMIN_EMAIL,
      staff: staffList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add new staff member (Super Admin controlled)
 * @route POST /api/admin/staff
 */
export const addStaffMember = async (req, res) => {
  try {
    const { name, email, role, phone, roleTitle, permissions } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Staff name and email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if staff email already exists
    const existsInMemory = inMemoryStaff.some((s) => s.email.toLowerCase() === cleanEmail);
    if (existsInMemory) {
      return res.status(400).json({ success: false, message: 'A staff member with this email already exists' });
    }

    const newStaff = {
      id: `staff-${Date.now()}`,
      name,
      email: cleanEmail,
      role: role || 'admin',
      roleTitle: roleTitle || (role === 'inventory_manager' ? 'Master Florist' : role === 'delivery_manager' ? 'Dispatch Lead' : 'Store Admin'),
      phone: phone || '',
      status: 'Active',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      permissions: permissions || ['manage_products', 'manage_orders'],
      joinedDate: new Date().toISOString().split('T')[0],
      isSuperAdmin: cleanEmail === SUPER_ADMIN_EMAIL,
    };

    if (getDBStatus()) {
      try {
        let existingUser = await UserModel.findOne({ email: cleanEmail });
        if (existingUser) {
          existingUser.role = newStaff.role;
          existingUser.name = name;
          if (phone) existingUser.phone = phone;
          await existingUser.save();
          newStaff._id = existingUser._id.toString();
        } else {
          const createdDoc = await UserModel.create({
            name,
            email: cleanEmail,
            passwordHash: '$2a$10$temporaryStaffHashPlaceHolder1234567890',
            role: newStaff.role,
            phone: phone || '',
          });
          newStaff._id = createdDoc._id.toString();
        }
      } catch (dbErr) {
        console.warn('MongoDB staff create warning:', dbErr.message);
      }
    }

    inMemoryStaff.push(newStaff);

    return res.status(201).json({
      success: true,
      message: `Staff member ${name} added successfully!`,
      staff: newStaff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update staff member details / role
 * @route PUT /api/admin/staff/:id
 */
export const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, roleTitle, status, permissions } = req.body;

    const index = inMemoryStaff.findIndex((s) => s.id === id || s._id === id);
    if (index !== -1) {
      // Prevent changing super admin role
      if (inMemoryStaff[index].isSuperAdmin && role && role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot modify Super Admin primary role' });
      }

      inMemoryStaff[index] = {
        ...inMemoryStaff[index],
        name: name || inMemoryStaff[index].name,
        role: role || inMemoryStaff[index].role,
        roleTitle: roleTitle || inMemoryStaff[index].roleTitle,
        phone: phone !== undefined ? phone : inMemoryStaff[index].phone,
        status: status || inMemoryStaff[index].status,
        permissions: permissions || inMemoryStaff[index].permissions,
      };

      if (getDBStatus()) {
        try {
          const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { email: inMemoryStaff[index].email };
          await UserModel.findOneAndUpdate(query, {
            name: inMemoryStaff[index].name,
            role: inMemoryStaff[index].role,
            phone: inMemoryStaff[index].phone,
          });
        } catch (dbErr) {
          console.warn('MongoDB staff update warning:', dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Staff details updated',
        staff: inMemoryStaff[index],
      });
    }

    return res.status(404).json({ success: false, message: 'Staff member not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete / Revoke staff member
 * @route DELETE /api/admin/staff/:id
 */
export const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;

    const target = inMemoryStaff.find((s) => s.id === id || s._id === id || s.email.toLowerCase() === id.toLowerCase());
    if (!target) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Protect Super Admin
    if (target.isSuperAdmin || target.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Security Protection: The Super Admin account cannot be removed.',
      });
    }

    inMemoryStaff = inMemoryStaff.filter((s) => s.id !== id && s._id !== id);

    if (getDBStatus()) {
      try {
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { email: target.email };
        await UserModel.findOneAndUpdate(query, { role: 'customer' });
      } catch (dbErr) {
        console.warn('MongoDB staff delete warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Staff member ${target.name} has been removed.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
