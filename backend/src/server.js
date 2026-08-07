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
// ✅ COMPLETE CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  
  // Render URLs
  'https://balaji-cars-1.onrender.com',
  'https://balaji-cars-frontend.onrender.com',
  'https://balaji-cars.onrender.com',
  
  // Custom Domain
  'https://balajicars.in',
  'https://www.balajicars.in',
  'http://balajicars.in',
  'http://www.balajicars.in',
  
  // Environment variable (fallback)
  process.env.CLIENT_URL
].filter(Boolean);

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

console.log('✅ Allowed CORS origins:', uniqueOrigins);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (uniqueOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('❌ Blocked by CORS:', origin);
        console.log('✅ Allowed origins:', uniqueOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight for 10 minutes
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

// Helmet with custom config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// More lenient rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/admin/auth', authLimiter);

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
    allowedOrigins: uniqueOrigins,
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
// ✅ STATIC FILES & FRONTEND - AFTER API ROUTES
// ============================================

// Check if frontend dist exists
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log(`📁 Frontend path: ${frontendPath}`);

// Serve static files from frontend dist
app.use(express.static(frontendPath));

// Catch-all for SPA frontend routes (AFTER API routes)
app.get('*', (req, res) => {
  // Check if the request is for an API route (should have been caught above)
  // If we get here, it's a frontend route
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (for API routes that weren't found)
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  console.error('Stack:', err.stack);
  // Don't crash the server in production
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  // Don't crash the server in production
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