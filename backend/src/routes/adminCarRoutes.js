const express = require('express');
const {
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  completeSale,
  updateCarFeatured,
  duplicateCar,
  bulkDeleteCars,
  bulkFeatureCars,
  getAdminCars,
  getDashboardStats,
  getAnalytics,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');
const { carImageUpload } = require('../middleware/upload');

const router = express.Router();

// Every route below requires a valid admin session.
router.use(protect, authorize('admin', 'superadmin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

router.get('/cars', getAdminCars);
router.post('/cars', carImageUpload.array('images', 20), createCar);
router.put('/cars/:id', carImageUpload.array('images', 20), updateCar);
router.delete('/cars/:id', deleteCar);
router.patch('/cars/:id/status', updateCarStatus);
router.patch('/cars/:id/complete-sale', completeSale);
router.patch('/cars/:id/feature', updateCarFeatured);
router.post('/cars/:id/duplicate', duplicateCar);
router.post('/cars/bulk-delete', bulkDeleteCars);
router.post('/cars/bulk-feature', bulkFeatureCars);

module.exports = router;
