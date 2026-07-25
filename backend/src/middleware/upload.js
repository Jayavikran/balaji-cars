const multer = require('multer');
const { carImageStorage, logoStorage } = require('../config/cloudinary');

const carImageUpload = multer({
  storage: carImageStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

module.exports = { carImageUpload, logoUpload };
