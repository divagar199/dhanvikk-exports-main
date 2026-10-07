import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin','manager','inventory_manager','delivery_manager','super_admin'), getAllOrders);
router.patch('/:orderId/status', protect, authorize('admin','manager','delivery_manager','super_admin'), updateOrderStatus);

export default router;
