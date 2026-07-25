const express = require('express');
const {
  getCars,
  getSearchSuggestions,
  getCarByIdOrSlug,
  getSimilarCars,
} = require('../controllers/carController');

const router = express.Router();

// All routes here are PUBLIC - no auth required.
router.get('/suggestions', getSearchSuggestions);
router.get('/:id/similar', getSimilarCars);
router.get('/:idOrSlug', getCarByIdOrSlug);
router.get('/', getCars);

module.exports = router;
