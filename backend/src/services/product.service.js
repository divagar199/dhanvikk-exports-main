import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductModel } from '../models/Product.js';
import { SEED_PRODUCTS } from '../data/seedProducts.js';
import { ApiError } from '../utils/apiError.js';
import { uploadsDir } from '../middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeProducts = async () => {
  try {
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding MongoDB with Dhanvikk luxury floral collections...');
      await ProductModel.insertMany(SEED_PRODUCTS);
      console.log(`✅ Seeded ${SEED_PRODUCTS.length} floral arrangements into MongoDB`);
    }
  } catch (err) {
    console.warn('Product auto-seed notice:', err.message);
  }
};

export const listProducts = async ({
  category,
  occasion,
  recipient,
  flowerType,
  search,
  sort,
  tag,
  limit = 200,
  page = 1,
} = {}) => {
  const query = {};

  if (category && category !== 'All' && category !== 'All Blooms') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }
  if (occasion && occasion !== 'All') {
    query.occasion = { $regex: new RegExp(`^${occasion}$`, 'i') };
  }
  if (recipient && recipient !== 'Everyone') {
    query.recipient = { $regex: new RegExp(`^${recipient}$`, 'i') };
  }
  if (flowerType && flowerType !== 'All') {
    query.flowerType = { $regex: new RegExp(`^${flowerType}$`, 'i') };
  }
  if (tag) {
    query.tag = { $regex: new RegExp(tag, 'i') };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { subCategory: { $regex: search, $options: 'i' } },
      { flowerType: { $regex: search, $options: 'i' } },
    ];
  }

  let sortOptions = { createdAt: -1 };
  if (sort === 'price-low') sortOptions = { price: 1 };
  else if (sort === 'price-high') sortOptions = { price: -1 };
  else if (sort === 'rating') sortOptions = { rating: -1 };
  else if (sort === 'newest') sortOptions = { createdAt: -1 };

  const parsedLimit = Math.min(Number(limit) || 200, 500);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [products, totalCount] = await Promise.all([
    ProductModel.find(query).sort(sortOptions).skip(skip).limit(parsedLimit).lean(),
    ProductModel.countDocuments(query),
  ]);

  return {
    products,
    count: products.length,
    total: totalCount,
    page: parsedPage,
    pages: Math.ceil(totalCount / parsedLimit),
  };
};

export const getProductByIdOrSlug = async (identifier) => {
  if (!identifier) {
    throw new ApiError(400, 'Product identifier is required');
  }

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isMongoId
    ? { $or: [{ _id: identifier }, { id: identifier }, { slug: identifier }] }
    : { $or: [{ id: identifier }, { slug: identifier }] };

  const product = await ProductModel.findOne(query).lean();
  if (!product) {
    throw new ApiError(404, `Flower arrangement not found with identifier: ${identifier}`);
  }

  return product;
};

export const createProduct = async (data) => {
  const {
    name,
    category = 'Flowers',
    subCategory = 'Hand Bouquets',
    occasion = 'All',
    recipient = 'Everyone',
    flowerType = 'Roses',
    price,
    originalPrice,
    stock = 20,
    stockCount,
    currency = 'INR',
    images = [],
    image = '',
    description = 'Handcrafted luxury botanical arrangement by Dhanvikk florists.',
    tag = 'NEW',
    isFeatured = true,
    isBestSeller = false,
    isNewArrival = false,
  } = data;

  const primaryImage = image || (Array.isArray(images) ? images[0] : images) || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
  const imageList = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await ProductModel.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const numPrice = Number(price);
  const numOriginalPrice = originalPrice ? Number(originalPrice) : numPrice;
  const numStock = Number(stockCount !== undefined ? stockCount : stock);

  const product = await ProductModel.create({
    id: `flw-${Date.now()}`,
    name,
    slug,
    category,
    subCategory,
    occasion,
    recipient,
    flowerType,
    price: numPrice,
    originalPrice: numOriginalPrice,
    stock: numStock,
    images: imageList,
    rating: 5.0,
    reviewsCount: 1,
    tag,
    description,
    isBestSeller: Boolean(isBestSeller),
    isFeatured: Boolean(isFeatured),
    isNewArrival: Boolean(isNewArrival),
    inStock: numStock > 0,
  });

  const productObj = product.toObject ? product.toObject() : { ...product._doc };
  if (!productObj.id) {
    productObj.id = product._id ? product._id.toString() : `flw-${Date.now()}`;
  }

  return productObj;
};

export const updateProduct = async (id, updates) => {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isMongoId ? { $or: [{ _id: id }, { id }] } : { id };

  const sanitized = { ...updates };
  if (sanitized.images && typeof sanitized.images === 'string') {
    sanitized.images = [sanitized.images];
  }
  if (sanitized.stock !== undefined || sanitized.stockCount !== undefined) {
    sanitized.stock = Number(sanitized.stock !== undefined ? sanitized.stock : sanitized.stockCount);
    sanitized.inStock = sanitized.stock > 0;
  }
  if (sanitized.price !== undefined) {
    sanitized.price = Number(sanitized.price);
  }
  if (sanitized.originalPrice !== undefined) {
    sanitized.originalPrice = Number(sanitized.originalPrice);
  }

  const product = await ProductModel.findOneAndUpdate(query, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Flower arrangement not found to update');
  }

  return product;
};

export const deleteProduct = async (id) => {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isMongoId ? { $or: [{ _id: id }, { id }] } : { id };

  const product = await ProductModel.findOneAndDelete(query);
  if (!product) {
    throw new ApiError(404, 'Flower arrangement not found to delete');
  }

  return true;
};

export const updateProductStock = async (id, { stock, delta }) => {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isMongoId ? { $or: [{ _id: id }, { id }] } : { id };

  const product = await ProductModel.findOne(query);
  if (!product) {
    throw new ApiError(404, 'Flower arrangement not found to adjust stock');
  }

  let newStock = product.stock || 0;
  if (stock !== undefined) {
    newStock = Math.max(0, Number(stock));
  } else if (delta !== undefined) {
    newStock = Math.max(0, newStock + Number(delta));
  }

  product.stock = newStock;
  product.inStock = newStock > 0;
  await product.save();

  return product;
};

export const getUploadedLocalImages = (req) => {
  const host = (typeof req.get === 'function' ? req.get('host') : null) || 'localhost:5000';
  const protocol = req.protocol || 'http';
  let images = [];

  // Files from uploadsDir
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

  // Files from public/images/products
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

  return images.reverse();
};
