import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/', getAllOrders);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
