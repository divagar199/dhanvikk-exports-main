import express from 'express';
import {
  getImageList,
  getImageCategories,
  serveImage,
} from '../controllers/imageController.js';
import { uploadProductImage } from '../controllers/productController.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// List all stored backend images (with filters ?category=...&search=...)
router.get('/', getImageList);
router.get('/list', getImageList);

// Image category counts
router.get('/categories', getImageCategories);

// Upload image (auto-converted to WebP)
router.post('/upload', uploadSingleImage, uploadProductImage);

// Direct API streaming of images:
// Supports /api/images/:category/:filename and wildcard /api/images/*
router.get('/:category/:filename', serveImage);
router.get('/*', serveImage);

export default router;
