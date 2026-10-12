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
} from '../controllers/product.controller.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  queryProductSchema,
} from '../validators/product.validator.js';

const router = express.Router();

router.get('/', validate(queryProductSchema), getProducts);
router.get('/local-images', getUploadedImages);
router.post('/upload', uploadSingleImage, uploadProductImage);
router.get('/:identifier', getProductById);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', validate(updateStockSchema), updateStock);

export default router;
