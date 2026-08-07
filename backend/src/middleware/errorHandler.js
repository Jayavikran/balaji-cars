// middleware/errorHandler.js

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  // Log error for debugging
  console.error('❌ Error Details:', {
    statusCode,
    message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    query: req.query,
    body: req.body,
    params: req.params,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
  }

  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? `${field} ` : ''}already in use.`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'CORS policy blocked this request.';
    console.log('❌ CORS blocked origin:', req.headers.origin);
  }

  // Rate limiting errors
  if (err.code === 'LIMIT_RATE_LIMIT') {
    statusCode = 429;
    message = 'Too many requests. Please try again later.';
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload.';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field.';
    } else {
      message = 'File upload error.';
    }
  }

  // Handle empty response body
  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        details: err,
        url: req.originalUrl,
        method: req.method
      })
    });
  }
};

module.exports = { notFound, errorHandler };