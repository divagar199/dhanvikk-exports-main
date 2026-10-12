import express from 'express';
import {
  getAllUsers,
  getAdminStats,
  getSuperAdminInfo,
  getAllStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  staffMemberSchema,
  updateStaffSchema,
} from '../validators/admin.validator.js';

const router = express.Router();

router.get('/users', protect, getAllUsers);
router.get('/stats', getAdminStats);

// Super Admin Staff Management Routes
router.get('/staff/info', getSuperAdminInfo);
router.get('/staff', getAllStaff);
router.post('/staff', validate(staffMemberSchema), addStaffMember);
router.put('/staff/:id', validate(updateStaffSchema), updateStaffMember);
router.delete('/staff/:id', deleteStaffMember);

export default router;
