import bcrypt from 'bcryptjs';

// Pre-hashed passwords:
// 'Bloom@2026' -> Customer
// 'admin@2026' -> Super Admin (Divagar M)
export const USERS = [
  {
    id: 'usr_super_adm_001',
    name: 'Divagar M (Super Admin)',
    email: 'divagar.m.msc.cs@gmail.com',
    passwordHash: bcrypt.hashSync('admin@2026', 10),
    role: 'super_admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'usr_cust_001',
    name: 'Aarav Patel',
    email: 'customer@dhanvikk.com',
    passwordHash: bcrypt.hashSync('Bloom@2026', 10),
    role: 'customer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-01-15T08:00:00Z'),
  },
];
