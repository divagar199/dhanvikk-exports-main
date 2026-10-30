import express from 'express';
import {
  login, googleLogin, googleRedirectCallback, getMe, logout, register, getProfileData, updateProfile,
  saveAddress, deleteAddress, toggleWishlistBouquet, verifyPortalKey, saveUserCart, changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.all('/google/callback', googleRedirectCallback);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/profile-data', protect, getProfileData);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, saveAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist', protect, toggleWishlistBouquet);
router.post('/cart', protect, saveUserCart);
router.post('/verify-portal', verifyPortalKey);
router.put('/change-password', changePassword);

export default router;
