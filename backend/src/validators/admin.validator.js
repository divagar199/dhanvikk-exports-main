import { z } from 'zod';

export const staffMemberSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, { message: 'Staff member name must be at least 2 characters long' }),
    email: z.string().trim().email({ message: 'Valid staff email address is required' }),
    role: z.enum(['admin', 'manager', 'inventory_manager', 'delivery_manager', 'super_admin', 'staff']).optional().default('admin'),
    phone: z.string().optional(),
    roleTitle: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

export const updateStaffSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    role: z.enum(['admin', 'manager', 'inventory_manager', 'delivery_manager', 'super_admin', 'staff']).optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    status: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});
