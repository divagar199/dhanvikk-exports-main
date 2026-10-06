import bcrypt from 'bcryptjs';

// Pre-hashed passwords:
// 'Bloom@2026' -> Customer
// 'AdminBloom@2026' -> Admin
// 'Manager@2026' -> Store Manager
export const USERS = [
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
  {
    id: 'usr_adm_001',
    name: 'Dhanvikk Administrator',
    email: 'admin@dhanvikk.com',
    passwordHash: bcrypt.hashSync('AdminBloom@2026', 10),
    role: 'admin',
    phone: '+91 98765 11111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2025-11-01T08:00:00Z'),
  },
  {
    id: 'usr_mgr_001',
    name: 'Priya Sharma (Store Manager)',
    email: 'manager@dhanvikk.com',
    passwordHash: bcrypt.hashSync('Manager@2026', 10),
    role: 'manager',
    phone: '+91 98765 22222',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2025-12-01T08:00:00Z'),
  },
];
