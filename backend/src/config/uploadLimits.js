// Single source of truth for upload size limits, used by both
// middleware/upload.js (to configure Multer) and middleware/errorHandler.js
// (to report the correct limit in the "file too large" error message).
const CAR_IMAGE_MAX_MB = 8;
const LOGO_MAX_MB = 3;

module.exports = {
  CAR_IMAGE_MAX_MB,
  LOGO_MAX_MB,
};
