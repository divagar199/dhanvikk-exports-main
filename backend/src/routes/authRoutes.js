import express from 'express';
import {
  login,
  googleLogin,
  initiateGoogleOAuth,
  googleOAuthCallback,
  exchangeGoogleOAuthCode,
  firebaseLogin,
  logout,
  register,
  verifyPortalKey,
} from '../controllers/auth.controller.js';
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
  loginSchema,
  registerSchema,
  googleLoginSchema,
  firebaseLoginSchema,
  addressSchema,
  updateProfileSchema,
  wishlistSchema,
  cartSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// Primary Authentication Routes
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.get('/google/login', initiateGoogleOAuth);
router.get('/google/callback', googleOAuthCallback);
router.post('/google/exchange', exchangeGoogleOAuthCode);
router.post('/firebase-login', validate(firebaseLoginSchema), firebaseLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Account Profile & Storage routes (Backward compatibility for Mobile & Web clients)
router.get('/profile-data', protect, getProfileData);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/addresses', protect, validate(addressSchema), saveAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist', protect, validate(wishlistSchema), toggleWishlist);
router.post('/cart', protect, validate(cartSchema), saveUserCart);
router.post('/verify-portal', verifyPortalKey);

export default router;
