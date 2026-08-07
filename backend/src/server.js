require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Public route groups
const carRoutes = require('./routes/carRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');

// Admin-only route groups
const adminCarRoutes = require('./routes/adminCarRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');

connectDB();

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://balaji-cars-1.onrender.com',
  'https://balaji-cars-frontend.onrender.com',
  'https://balaji-cars.onrender.com',
  'https://balajicars.in',
  'https://www.balajicars.in',
  'http://balajicars.in',
  'http://www.balajicars.in',
  process.env.CLIENT_URL
].filter(Boolean);

const uniqueOrigins = [...new Set(allowedOrigins)];

console.log('✅ Allowed CORS origins:', uniqueOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (uniqueOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 600
}));

app.options('*', cors());

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

app.use('/api/admin/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.'
}));

// ============================================
// ✅ API ROUTES - MUST COME FIRST
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BALAJI CARS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoDB: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Balaji Cars API is running',
    version: '1.0.0',
    endpoints: {
      public: {
        cars: '/api/cars',
        enquiries: '/api/enquiries',
        settings: '/api/settings',
        health: '/api/health'
      },
      admin: {
        auth: '/api/admin/auth',
        cars: '/api/admin/cars',
        enquiries: '/api/admin/enquiries',
        settings: '/api/admin/settings'
      }
    }
  });
});

// Sitemap
const { getSitemap } = require('./controllers/sitemapController');
app.get('/api/sitemap.xml', getSitemap);
app.get('/sitemap.xml', getSitemap);

// ---- Public API Routes ----
app.use('/api/cars', carRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingsRoutes);

// ---- Admin API Routes ----
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminCarRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/settings', settingsRoutes);

// ============================================
// ============================================
// ✅ STATIC FILES & FRONTEND - AFTER API ROUTES
// ============================================

// ✅ CORRECT PATH - Go up two levels from backend/src
const frontendPath = path.join(__dirname, '../../frontend/dist');
console.log(`📁 Frontend path: ${frontendPath}`);

// Serve static files from frontend dist
app.use(express.static(frontendPath));

// Catch-all for SPA frontend routes (AFTER API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BALAJI CARS API listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api/health`);
  console.log(`📁 Frontend path: ${frontendPath}`);
  console.log(`✅ Allowed CORS origins:`, uniqueOrigins);
});