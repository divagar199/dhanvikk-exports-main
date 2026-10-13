import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';
import { initializeProducts } from './src/controllers/productController.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB().then(() => {
  initializeProducts();
});

// Security Headers (allow cross-origin resource policy for uploaded botanical images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Serve locally uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve stored botanical images statically with automatic .webp format resolution
const imagesStaticDir = path.join(__dirname, 'public', 'images');
app.use('/images', (req, res, next) => {
  const cleanPath = req.path.replace(/^\/+/, '');
  const filePath = path.join(imagesStaticDir, cleanPath);
  if (fs.existsSync(filePath)) {
    return next();
  }
  // Auto-resolve .jpg or .png to modern .webp
  const parsed = path.parse(filePath);
  const webpCandidate = path.join(parsed.dir, `${parsed.name}.webp`);
  if (fs.existsSync(webpCandidate)) {
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(webpCandidate);
  }
  next();
});
app.use('/images', express.static(imagesStaticDir));

// Cross-Origin Resource Sharing
const rawClientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');
const allowedOrigins = [
  rawClientUrl,
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('dhanvikk') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, origin);
    },
    credentials: true,
  })
);

// Body Parsing & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting for Auth APIs
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a moment before trying again.',
  },
});

app.use('/api/auth', authLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dhanvikk Blooms Backend API (Dhanvikk Luxury Floristry Engine)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🌸 Dhanvikk Blooms Backend listening on http://localhost:${PORT}`);
  console.log(`📡 CORS allowed for: ${CLIENT_URL}`);
});

export default app;
