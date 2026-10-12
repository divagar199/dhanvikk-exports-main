import express from 'express';
import {
  getMe,
  getProfileData,
  updateProfile,
  saveAddress,
  deleteAddress,
  toggleWishlist,
  saveUserCart,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  addressSchema,
  updateProfileSchema,
  wishlistSchema,
  cartSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/profile', protect, getProfileData);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/addresses', protect, validate(addressSchema), saveAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist', protect, validate(wishlistSchema), toggleWishlist);
router.post('/cart', protect, validate(cartSchema), saveUserCart);

export default router;
