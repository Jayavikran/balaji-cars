require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Public route groups
const carRoutes = require('./routes/carRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');

// Admin-only route groups (each applies its own `protect` middleware)
const adminCarRoutes = require('./routes/adminCarRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');

connectDB();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic global rate limit as defense-in-depth (per-route limiters add stricter caps).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'BALAJI CARS API is running' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Balaji Cars API is running',
    endpoints: {
      public: {
        cars: '/api/cars',
        enquiries: '/api/enquiries',
        settings: '/api/settings'
      },
      admin: {
        auth: '/api/admin/auth',
        cars: '/api/admin/cars',
        enquiries: '/api/admin/enquiries',
        settings: '/api/admin/settings'  // ✅ This is now available
      }
    }
  });
});

const { getSitemap } = require('./controllers/sitemapController');
app.get('/api/sitemap.xml', getSitemap);
app.get('/sitemap.xml', getSitemap);

// ---- Public API (customers browsing the storefront) ----
app.use('/api/cars', carRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingsRoutes);  // Public settings - GET only

// ---- Admin API (everything under /api/admin/* requires JWT auth) ----
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminCarRoutes);  // Admin car routes
app.use('/api/admin/enquiries', adminEnquiryRoutes);  // Admin enquiry routes
app.use('/api/admin/settings', settingsRoutes);  // ✅ ADD THIS LINE - Admin settings routes

// 404 handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BALAJI CARS API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});