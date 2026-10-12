import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator.js';

const router = express.Router();

router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.patch('/:orderId/status', protect, authorize('admin', 'manager'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
