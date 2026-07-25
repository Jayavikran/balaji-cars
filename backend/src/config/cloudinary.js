const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine used by multer for car image uploads
const carImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'BALAJI CARS/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for the company logo (settings)
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'BALAJI CARS/branding',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
});

module.exports = { cloudinary, carImageStorage, logoStorage };
