require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');
const Car = require('./models/Car');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Routes
const carRoutes = require('./routes/carRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');
const authRoutes = require('./routes/authRoutes');
const adminCarRoutes = require('./routes/adminCarRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

// Connect Database
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
  process.env.CLIENT_URL,
  'http://localhost:5174'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ============================================
// TRUST PROXY (CRITICAL FOR RENDER + CLOUDFLARE)
// ============================================
// This tells Express to trust the first proxy (Render) so req.ip works properly
app.set('trust proxy', 1); 

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  }
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '2mb'
}));

app.use(cookieParser());

app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

// ============================================
// RATE LIMITER (FIXED FOR PROXY ERRORS)
// ============================================

// Custom key generator to grab Cloudflare's real IP header to prevent warnings
const cloudflareKeyGenerator = (req) => {
  return req.headers['cf-connecting-ip'] || req.ip || req.connection.remoteAddress;
};

// General API Limiter
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  keyGenerator: cloudflareKeyGenerator,
  message: 'Too many requests. Please try again later.'
}));

// Strict Auth Limiter
app.use('/api/admin/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: cloudflareKeyGenerator,
  message: 'Too many login attempts. Please try again later.'
}));

// Enquiry Limiter — the public lead form (POST /api/enquiries) had no
// dedicated limit beyond the general 500/15min API-wide one, making it an
// easy target for a scripted spam flood. This only applies to the public
// enquiry-submission route, not the admin enquiries list/management routes.
app.use('/api/enquiries', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: cloudflareKeyGenerator,
  message: 'Too many enquiries submitted. Please try again later.'
}));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BALAJI CARS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoDB:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected'
  });
});

// ============================================
// API ROOT
// ============================================

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Balaji Cars API',
    version: '1.0.0'
  });
});

const getPublicSiteUrl = (req) => {
  const configured = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  return host ? `${protocol}://${host}`.replace(/\/$/, '') : 'https://www.balajicars.in';
};

app.get('/robots.txt', (req, res) => {
  const siteUrl = getPublicSiteUrl(req);
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /compare\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
});

// Sitemap must be registered before any SPA catch-all so the backend
// serves XML directly instead of falling through to HTML.
app.use('/', sitemapRoutes);

app.get('/cars/:idOrSlug', async (req, res, next) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  try {
    const car = await Car.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }).select('slug').lean();
    if (car && car.slug && car.slug !== idOrSlug) {
      return res.redirect(301, `/cars/${car.slug}`);
    }
  } catch (error) {
    return next(error);
  }

  next();
});

// ============================================
// PUBLIC ROUTES
// ============================================

app.use('/api/cars', carRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingsRoutes);

// ============================================
// ADMIN ROUTES
// ============================================

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminCarRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

// ============================================
// 🔥 NUCLEAR CACHE KILLER FOR FRONTEND ASSETS
// ============================================
// This forces the browser to NEVER cache your JS/CSS files.
app.use((req, res, next) => {
  // Only apply to static frontend assets (JS, CSS, HTML)
  if (req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// ============================================
// API 404 (must come before the SPA catch-all below, or unmatched /api/*
// requests silently fall through to index.html with a 200 status)
// ============================================

app.all('/api/*', notFound);

// ============================================
// FRONTEND (React Build)
// ============================================

const frontendPath = path.join(__dirname, '../../frontend/dist');

console.log('📁 Frontend path:', frontendPath);

app.use(express.static(frontendPath));

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
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Frontend path: ${frontendPath}`);
});
