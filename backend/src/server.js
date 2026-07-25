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

// Admin-only route groups
const adminCarRoutes = require('./routes/adminCarRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');

connectDB();

const app = express();

// ✅ FIXED CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://balaji-cars-1.onrender.com',
  'https://balaji-cars-frontend.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('❌ Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic global rate limit
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
        settings: '/api/admin/settings'
      }
    }
  });
});

const { getSitemap } = require('./controllers/sitemapController');
app.get('/api/sitemap.xml', getSitemap);
app.get('/sitemap.xml', getSitemap);

// ---- Public API ----
app.use('/api/cars', carRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingsRoutes);

// ---- Admin API ----
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminCarRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/settings', settingsRoutes);

// 404 handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BALAJI CARS API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});