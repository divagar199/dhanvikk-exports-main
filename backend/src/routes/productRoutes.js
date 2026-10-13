import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  uploadProductImage,
  getUploadedImages,
  addProductReview,
} from '../controllers/productController.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/local-images', getUploadedImages);
router.post('/upload', uploadSingleImage, uploadProductImage);
router.get('/:identifier', getProductById);
router.post('/:identifier/reviews', protect, addProductReview);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;

