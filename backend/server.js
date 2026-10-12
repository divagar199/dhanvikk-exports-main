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
import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';
import { initializeProducts } from './src/services/product.service.js';
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

// Validate required environment configuration
if (process.env.NODE_ENV === 'production') {
  const requiredProductionVars = ['JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = requiredProductionVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing mandatory production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Cross-Origin Resource Sharing
const rawClientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');
const allowedOrigins = new Set(
  [
    rawClientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'https://dhanvikk-exports-main.vercel.app',
    'https://dhanvikk-blooms.vercel.app',
    'https://dhanvikk.vercel.app',
  ].filter(Boolean)
);

const isDevLocalhost = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps native HTTP, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin) || isDevLocalhost(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy violation: origin '${origin}' is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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

// Root & Health Check Endpoints (Resolves Render uptime checks and direct browser visits)
app.all(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Dhanvikk Blooms Backend API',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🌸 Dhanvikk Blooms Backend listening on http://localhost:${PORT}`);
    console.log(`📡 CORS allowed for: ${CLIENT_URL}`);
  });
}

export { server };
export default app;

