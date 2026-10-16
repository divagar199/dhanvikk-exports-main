import { ProductModel } from '../models/Product.js';
import { SEED_PRODUCTS } from '../data/seedProducts.js';
import { getDBStatus } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadsDir } from '../middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inMemoryProducts = [...SEED_PRODUCTS];

// Auto-seed to MongoDB if connected and empty
export const initializeProducts = async () => {
  if (getDBStatus()) {
    try {
      const count = await ProductModel.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding MongoDB with Dhanvikk luxury floral collections...');
        await ProductModel.insertMany(SEED_PRODUCTS);
      }
    } catch (err) {
      console.warn('Product seed warning:', err.message);
    }
  }
};

/**
 * @desc Get all products with filters
 * @route GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const { category, occasion, recipient, flowerType, search, sort, tag, limit } = req.query;

    if (getDBStatus()) {
      let query = {};
      if (category && category !== 'All' && category !== 'All Blooms') {
        query.category = { $regex: new RegExp(category, 'i') };
      }
      if (occasion && occasion !== 'All') {
        query.occasion = { $regex: new RegExp(occasion, 'i') };
      }
      if (recipient && recipient !== 'Everyone') {
        query.recipient = { $regex: new RegExp(recipient, 'i') };
      }
      if (flowerType && flowerType !== 'All') {
        query.flowerType = { $regex: new RegExp(flowerType, 'i') };
      }
      if (tag) {
        query.tag = { $regex: new RegExp(tag, 'i') };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOptions = {};
      if (sort === 'price-low') sortOptions.price = 1;
      else if (sort === 'price-high') sortOptions.price = -1;
      else if (sort === 'rating') sortOptions.rating = -1;
      else sortOptions.createdAt = -1;

      const products = await ProductModel.find(query)
        .sort(sortOptions)
        .limit(limit ? Number(limit) : 500);

      return res.status(200).json({ success: true, count: products.length, products });
    }

    // Memory store fallback
    let filtered = [...inMemoryProducts];
    if (category && category !== 'All' && category !== 'All Blooms') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (occasion && occasion !== 'All') {
      filtered = filtered.filter((p) => p.occasion.toLowerCase() === occasion.toLowerCase());
    }
    if (recipient && recipient !== 'Everyone') {
      filtered = filtered.filter((p) => p.recipient.toLowerCase() === recipient.toLowerCase());
    }
    if (flowerType && flowerType !== 'All') {
      filtered = filtered.filter((p) => p.flowerType.toLowerCase() === flowerType.toLowerCase());
    }
    if (tag) {
      filtered = filtered.filter((p) => p.tag.toLowerCase().includes(tag.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    return res.status(200).json({ success: true, count: filtered.length, products: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single product by ID or slug
 * @route GET /api/products/:identifier
 */
export const getProductById = async (req, res) => {
  try {
    const { identifier } = req.params;

    if (getDBStatus()) {
      const product = await ProductModel.findOne({
        $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { id: identifier }, { slug: identifier }],
      });
      if (product) {
        const prodObj = product.toObject ? product.toObject() : product;
        if (!Array.isArray(prodObj.reviews) || prodObj.reviews.length === 0) {
          prodObj.reviews = getDefaultReviews(prodObj.name);
        }
        return res.status(200).json({ success: true, product: prodObj });
      }
    }

    const product = inMemoryProducts.find((p) => p.id === identifier || p.slug === identifier);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Flower product not found' });
    }

    if (!Array.isArray(product.reviews) || product.reviews.length === 0) {
      product.reviews = getDefaultReviews(product.name);
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create new product (Admin)
 * @route POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, image, images, description, tag, occasion, recipient, flowerType } = req.body;

    const primaryImage = image || (Array.isArray(images) ? images[0] : images) || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
    const imageList = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newProduct = {
      id: `flw-${Date.now()}`,
      name,
      slug,
      category: category || 'Flowers',
      subCategory: req.body.subCategory || 'Hand Bouquets',
      occasion: occasion || 'All',
      recipient: recipient || 'Everyone',
      flowerType: flowerType || 'Roses',
      price: Number(price) || 999,
      originalPrice: Number(originalPrice || price) || Number(price) || 1299,
      stock: Number(stock !== undefined ? stock : 20),
      images: imageList,
      rating: 5.0,
      reviewsCount: 1,
      tag: tag || 'NEW',
      description: description || 'Fresh luxury floral design handcrafted by master florists.',
      isBestSeller: false,
      isFeatured: true,
      inStock: Number(stock !== undefined ? stock : 20) > 0,
      createdAt: new Date(),
    };

    if (getDBStatus()) {
      try {
        const createdDoc = await ProductModel.create(newProduct);
        newProduct._id = createdDoc._id;
      } catch (dbErr) {
        console.warn('MongoDB product create warning:', dbErr.message);
      }
    }
    inMemoryProducts.unshift(newProduct);

    return res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update product (Admin)
 * @route PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.images && typeof updates.images === 'string') {
      updates.images = [updates.images];
    }
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
      updates.inStock = updates.stock > 0;
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }
    if (updates.originalPrice !== undefined) {
      updates.originalPrice = Number(updates.originalPrice);
    }

    let updatedDoc = null;
    if (getDBStatus()) {
      try {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };
        updatedDoc = await ProductModel.findOneAndUpdate(query, updates, { new: true });
      } catch (dbErr) {
        console.warn('MongoDB product update warning:', dbErr.message);
      }
    }

    const index = inMemoryProducts.findIndex((p) => p.id === id || p._id?.toString() === id);
    if (index !== -1) {
      inMemoryProducts[index] = { ...inMemoryProducts[index], ...updates };
      return res.status(200).json({ success: true, message: 'Product updated', product: inMemoryProducts[index] });
    }

    if (updatedDoc) {
      return res.status(200).json({ success: true, message: 'Product updated', product: updatedDoc });
    }

    return res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete product (Admin)
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      try {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };
        await ProductModel.findOneAndDelete(query);
      } catch (dbErr) {
        console.warn('MongoDB product delete warning:', dbErr.message);
      }
    }

    inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id && p._id?.toString() !== id);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Quick Stock Adjuster (Admin)
 * @route PATCH /api/products/:id/stock
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;

    let targetProduct = null;
    let newStock = 0;

    const index = inMemoryProducts.findIndex((p) => p.id === id || p._id?.toString() === id);
    if (index !== -1) {
      let currentStock = inMemoryProducts[index].stock || 0;
      if (stock !== undefined) {
        newStock = Math.max(0, Number(stock));
      } else if (delta !== undefined) {
        newStock = Math.max(0, currentStock + Number(delta));
      }
      inMemoryProducts[index].stock = newStock;
      inMemoryProducts[index].inStock = newStock > 0;
      targetProduct = inMemoryProducts[index];
    }

    if (getDBStatus()) {
      try {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };
        const doc = await ProductModel.findOne(query);
        if (doc) {
          let currentStock = doc.stock || 0;
          if (stock !== undefined) {
            newStock = Math.max(0, Number(stock));
          } else if (delta !== undefined) {
            newStock = Math.max(0, currentStock + Number(delta));
          }
          doc.stock = newStock;
          doc.inStock = newStock > 0;
          await doc.save();
          targetProduct = doc;
        }
      } catch (dbErr) {
        console.warn('MongoDB stock update warning:', dbErr.message);
      }
    }

    if (!targetProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Stock updated to ${newStock}`,
      product: targetProduct,
      stock: newStock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Upload image and store locally in code (uploads/)
 * @route POST /api/products/upload
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const host = (typeof req.get === 'function' ? req.get('host') : null) || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const filename = req.file.filename;
    const relativeUrl = `/uploads/${filename}`;
    const fullUrl = `${protocol}://${host}/uploads/${filename}`;

    return res.status(200).json({
      success: true,
      message: 'Product image uploaded and stored locally in code!',
      imageUrl: fullUrl,
      relativeUrl,
      filename,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all locally uploaded images
 * @route GET /api/products/local-images
 */
export const getUploadedImages = async (req, res) => {
  try {
    const host = (typeof req.get === 'function' ? req.get('host') : null) || 'localhost:5000';
    const protocol = req.protocol || 'http';
    let images = [];

    // 1. Files from uploadsDir
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const uploadImages = files
        .filter((file) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
        .map((file) => ({
          filename: file,
          category: 'uploads',
          relativeUrl: `/uploads/${file}`,
          fullUrl: `${protocol}://${host}/uploads/${file}`,
        }));
      images = images.concat(uploadImages);
    }

    // 2. Files from public/images/products
    const publicProductsDir = path.resolve(__dirname, '../../public/images/products');
    if (fs.existsSync(publicProductsDir)) {
      const prodFiles = fs.readdirSync(publicProductsDir);
      const prodImages = prodFiles
        .filter((file) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
        .map((file) => ({
          filename: file,
          category: 'products',
          relativeUrl: `/images/products/${file}`,
          fullUrl: `${protocol}://${host}/images/products/${file}`,
        }));
      images = images.concat(prodImages);
    }

    return res.status(200).json({ success: true, count: images.length, images: images.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDefaultReviews = (productName = 'Blooms') => [
  {
    id: 'rev-def-1',
    userName: 'Amina Al-Mansoor',
    rating: 5,
    comment: 'Pristine highland blooms! Delivered crisply chilled with morning dew still on the petals. Fragrance lasted over a week.',
    verified: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-def-2',
    userName: 'Vikram Malhotra',
    rating: 5,
    comment: 'Exceptional floristry. Heavy-caliber stems, velvet packaging, and handwriting card made the occasion deeply memorable.',
    verified: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'rev-def-3',
    userName: 'Dr. Priya Sundaram',
    rating: 4,
    comment: 'Arrived right on schedule in refrigerated transit. The blossoms opened up magnificently over the next 48 hours.',
    verified: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

/**
 * @desc Add a review and rating for a product (Auth required)
 * @route POST /api/products/:identifier/reviews
 */
export const addProductReview = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { rating, comment, userName: customName } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5 stars.' });
    }

    const userName = req.user?.name || customName || 'Verified Customer';
    const userEmail = req.user?.email || '';
    const userId = req.user?._id?.toString() || req.user?.id || 'verified_customer';

    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      userName,
      userEmail,
      rating: numRating,
      comment: (comment && String(comment).trim()) || 'Verified Dhanvikk luxury floral arrangement.',
      verified: true,
      createdAt: new Date(),
    };

    let updatedProduct = null;

    if (getDBStatus()) {
      const product = await ProductModel.findOne({
        $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { id: identifier }, { slug: identifier }],
      });
      if (product) {
        if (!Array.isArray(product.reviews)) {
          product.reviews = [];
        }
        product.reviews.unshift(newReview);
        const curCount = product.reviews.length;
        const totalStars = product.reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        product.rating = Number((totalStars / curCount).toFixed(1));
        product.reviewsCount = curCount;
        await product.save();
        updatedProduct = product.toObject ? product.toObject() : product;
      }
    }

    // Always update inMemoryProducts so reviews are permanently retained in server memory
    const idx = inMemoryProducts.findIndex((p) => p.id === identifier || p.slug === identifier || p._id === identifier);
    if (idx !== -1) {
      const p = inMemoryProducts[idx];
      if (!Array.isArray(p.reviews)) {
        p.reviews = [];
      }
      p.reviews.unshift(newReview);
      const curCount = p.reviews.length;
      const totalStars = p.reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
      p.rating = Number((totalStars / curCount).toFixed(1));
      p.reviewsCount = curCount;
      if (!updatedProduct) {
        updatedProduct = p;
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Flower product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Review and rating submitted successfully! 🌸',
      product: updatedProduct,
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all verified reviews for a product
 * @route GET /api/products/:identifier/reviews
 */
export const getProductReviews = async (req, res) => {
  try {
    const { identifier } = req.params;
    let reviews = [];

    if (getDBStatus()) {
      const product = await ProductModel.findOne({
        $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { id: identifier }, { slug: identifier }],
      });
      if (product && Array.isArray(product.reviews) && product.reviews.length > 0) {
        reviews = product.reviews;
      }
    }

    if (reviews.length === 0) {
      const product = inMemoryProducts.find((p) => p.id === identifier || p.slug === identifier);
      if (product && Array.isArray(product.reviews) && product.reviews.length > 0) {
        reviews = product.reviews;
      } else {
        reviews = getDefaultReviews(product?.name || 'Blooms');
      }
    }

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

