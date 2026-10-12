import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/payment.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} from '../validators/order.validator.js';

const router = express.Router();

router.post('/create-order', validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/verify-payment', validate(verifyRazorpayPaymentSchema), verifyRazorpayPayment);

export default router;
