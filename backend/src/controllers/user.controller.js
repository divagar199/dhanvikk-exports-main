import {
  getUserProfileData,
  updateUserProfile,
  saveUserAddress,
  deleteUserAddress,
  toggleWishlistBouquet,
  saveCart,
  getUserByIdOrEmail,
} from '../services/user.service.js';
import { formatUserResponse } from '../services/auth.service.js';
import { ApiError } from '../utils/apiError.js';

const resolveIdentifier = (req) => {
  return (
    req.user?._id?.toString() ||
    req.user?.id ||
    req.user?.email ||
    null
  );
};

export const getMe = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    if (!identifier) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await getUserByIdOrEmail(identifier);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileData = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    if (!identifier) {
      return res.status(200).json({
        success: true,
        savedAddresses: [],
        savedBouquets: [],
        cart: [],
        recentOrders: [],
      });
    }

    const profileData = await getUserProfileData(identifier);
    return res.status(200).json({
      success: true,
      ...profileData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    if (!identifier) {
      throw new ApiError(401, 'Authentication or user email required');
    }

    const updated = await updateUserProfile(identifier, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const saveAddress = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    if (!identifier) {
      throw new ApiError(401, 'Authentication or user email required to save address');
    }

    const result = await saveUserAddress(identifier, req.body);
    return res.status(200).json({
      success: true,
      message: 'Address saved successfully',
      address: result.address,
      savedAddresses: result.savedAddresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    const { id } = req.params;

    if (!identifier) {
      throw new ApiError(401, 'Authentication or user email required to delete address');
    }

    const result = await deleteUserAddress(identifier, id);
    return res.status(200).json({
      success: true,
      message: 'Address removed successfully',
      savedAddresses: result.savedAddresses,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    const { bouquet } = req.body;

    if (!identifier) {
      throw new ApiError(401, 'Authentication or user email required');
    }

    const result = await toggleWishlistBouquet(identifier, bouquet);
    return res.status(200).json({
      success: true,
      message: result.isSaved ? 'Added to wishlist' : 'Removed from wishlist',
      isSaved: result.isSaved,
      savedBouquets: result.savedBouquets,
    });
  } catch (error) {
    next(error);
  }
};

export const saveUserCart = async (req, res, next) => {
  try {
    const identifier = resolveIdentifier(req);
    const { cart } = req.body;

    if (!identifier) {
      throw new ApiError(401, 'Authentication or user email required to sync cart');
    }

    const result = await saveCart(identifier, cart);
    return res.status(200).json({
      success: true,
      message: 'Cart synchronized successfully',
      cart: result.cart,
    });
  } catch (error) {
    next(error);
  }
};
