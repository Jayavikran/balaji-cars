const multer = require('multer');
const { carImageStorage, logoStorage } = require('../config/cloudinary');
const { CAR_IMAGE_MAX_MB, LOGO_MAX_MB } = require('../config/uploadLimits');

const carImageUpload = multer({
  storage: carImageStorage,
  limits: { fileSize: CAR_IMAGE_MAX_MB * 1024 * 1024 },
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: LOGO_MAX_MB * 1024 * 1024 },
});

module.exports = { carImageUpload, logoUpload };
