import { UserModel } from '../models/User.js';
import { OrderModel } from '../models/Order.js';
import { ApiError } from '../utils/apiError.js';
import { resolveGoogleAvatar, formatUserResponse } from './auth.service.js';

export const getUserByIdOrEmail = async (identifier) => {
  if (!identifier) return null;
  const clean = identifier.toString().trim();
  let user = null;
  if (clean.includes('@')) {
    user = await UserModel.findOne({ email: clean.toLowerCase() });
  } else {
    try {
      user = await UserModel.findById(clean);
    } catch {
      user = await UserModel.findOne({ email: clean.toLowerCase() });
    }
  }
  return user;
};

/**
 * Retrieves complete user profile data with persisted addresses, wishlist, and recent orders
 */
export const getUserProfileData = async (identifier) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  // Fetch real order history from MongoDB
  const recentOrders = await OrderModel.find({
    $or: [{ 'user.email': user.email }, { 'user.id': user._id.toString() }],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    user: formatUserResponse(user),
    savedAddresses: user.savedAddresses || [],
    savedBouquets: user.savedBouquets || [],
    cart: user.cart || [],
    recentOrders: recentOrders || [],
  };
};

/**
 * Updates profile fields (name, phone, avatar)
 */
export const updateUserProfile = async (identifier, { name, phone, avatar }) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (name && name.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();
  return formatUserResponse(user);
};

/**
 * Saves or updates a delivery address directly in MongoDB
 */
export const saveUserAddress = async (identifier, addressData) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  const streetStr = addressData.street || addressData.streetAddress || '';
  if (!streetStr) {
    throw new ApiError(422, 'Street address is required');
  }

  const addressId = addressData.id || `addr_${Date.now()}`;
  const newAddress = {
    id: addressId,
    title: addressData.title || 'Delivery Destination',
    recipientName: addressData.fullName || addressData.recipientName || user.name || '',
    phone: addressData.phone || user.phone || '',
    street: streetStr,
    district: addressData.district || '',
    city: addressData.city || 'Dubai',
    state: addressData.state || 'Dubai',
    postalCode: addressData.postalCode || addressData.pincode || addressData.zipCode || '',
    country: addressData.country || 'United Arab Emirates',
    isDefault: Boolean(addressData.isDefault),
  };

  const existingIndex = user.savedAddresses.findIndex((a) => a.id === addressId);

  if (newAddress.isDefault) {
    // Unset other default addresses
    user.savedAddresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  if (existingIndex >= 0) {
    user.savedAddresses[existingIndex] = newAddress;
  } else {
    // If first address, make it default
    if (user.savedAddresses.length === 0) {
      newAddress.isDefault = true;
    }
    user.savedAddresses.push(newAddress);
  }

  await user.save();
  return {
    address: newAddress,
    savedAddresses: user.savedAddresses,
  };
};

/**
 * Deletes address by ID from user profile
 */
export const deleteUserAddress = async (identifier, addressId) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  user.savedAddresses = user.savedAddresses.filter((a) => a.id !== addressId);
  await user.save();

  return {
    savedAddresses: user.savedAddresses,
  };
};

/**
 * Toggles a bouquet in user's savedBouquets/wishlist
 */
export const toggleWishlistBouquet = async (identifier, bouquet) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (!bouquet || !bouquet.id) {
    throw new ApiError(422, 'Valid bouquet item with ID is required');
  }

  const bouquetId = bouquet.id;
  const existingIndex = user.savedBouquets.findIndex((b) => b.id === bouquetId);
  let isSaved = false;

  if (existingIndex >= 0) {
    user.savedBouquets.splice(existingIndex, 1);
    isSaved = false;
  } else {
    user.savedBouquets.unshift({
      id: bouquetId,
      name: bouquet.name,
      price: bouquet.price,
      currency: bouquet.currency || 'INR',
      category: bouquet.category || 'Flowers',
      image: bouquet.image,
      inStock: bouquet.inStock !== false,
      rating: bouquet.rating || 5,
      addedAt: new Date(),
    });
    isSaved = true;
  }

  await user.save();
  return {
    isSaved,
    savedBouquets: user.savedBouquets,
  };
};

/**
 * Saves current cart to MongoDB
 */
export const saveCart = async (identifier, cartItems) => {
  const user = await getUserByIdOrEmail(identifier);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  const safeCart = Array.isArray(cartItems) ? cartItems : [];
  user.cart = safeCart;
  await user.save();

  return {
    cart: user.cart,
  };
};

/**
 * Backward compatibility helpers for order sync to user profile
 */
export const recordUserOrder = async (email, order) => {
  // Orders are automatically retrieved by user email in getUserProfileData via OrderModel.find
  return true;
};

export const recordUserAddress = async (email, address) => {
  try {
    if (email && address) {
      await saveUserAddress(email, address);
    }
  } catch (err) {
    console.warn('recordUserAddress note:', err.message);
  }
};
