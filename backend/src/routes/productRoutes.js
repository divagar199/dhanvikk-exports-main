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
} from '../controllers/productController.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/local-images', getUploadedImages);
router.post('/upload', uploadSingleImage, uploadProductImage);
router.get('/:identifier', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;

