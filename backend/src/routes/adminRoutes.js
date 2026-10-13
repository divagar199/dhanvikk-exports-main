import express from 'express';
import { getAllUsers, getAdminStats } from '../controllers/adminController.js';
import {
  getAllStaff,
  getSuperAdminInfo,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from '../controllers/staffController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/stats', getAdminStats);

// Super Admin Staff Management Routes
router.get('/staff/info', getSuperAdminInfo);
router.get('/staff', getAllStaff);
router.post('/staff', addStaffMember);
router.put('/staff/:id', updateStaffMember);
router.delete('/staff/:id', deleteStaffMember);

export default router;

