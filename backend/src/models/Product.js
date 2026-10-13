import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Flowers',
        'Occasions',
        'Gift Bundles',
        'Plants',
        'Forever Roses',
        'Flower Boxes',
        'Hand Bouquets',
        'Luxury Arrangements',
      ],
      default: 'Flowers',
    },
    subCategory: {
      type: String,
      default: 'Roses',
    },
    occasion: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Love & Romance', 'Congratulations', 'Sympathy', 'Get Well', 'Housewarming', 'All'],
      default: 'All',
    },
    recipient: {
      type: String,
      enum: ['For Her', 'For Him', 'For Mom', 'For Dad', 'BFFs', 'Everyone'],
      default: 'Everyone',
    },
    flowerType: {
      type: String,
      enum: ['Roses', 'Lilies', 'Tulips', 'Peonies', 'Orchids', 'Sunflowers', 'Mixed'],
      default: 'Roses',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 25,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 24,
    },
    tag: {
      type: String,
      default: 'SALE',
    },
    description: {
      type: String,
      required: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
