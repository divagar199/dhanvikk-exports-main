import express from 'express';
import {
  login,
  googleLogin,
  getMe,
  logout,
  register,
  getProfileData,
  updateProfile,
  saveAddress,
  deleteAddress,
  toggleWishlistBouquet,
  verifyPortalKey,
  saveUserCart,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Account Profile & Storage routes
router.get('/profile-data', getProfileData);
router.put('/profile', updateProfile);
router.post('/addresses', saveAddress);
router.delete('/addresses/:id', deleteAddress);
router.post('/wishlist', toggleWishlistBouquet);
router.post('/cart', saveUserCart);
router.post('/verify-portal', verifyPortalKey);

export default router;
