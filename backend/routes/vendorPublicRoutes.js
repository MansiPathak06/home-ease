const express = require('express');
const router = express.Router();
const vendorPublicController = require('../controllers/vendorPublicController');

// Public routes (no authentication required)

// Get all approved vendors
router.get('/approved', vendorPublicController.getApprovedVendors);

// Search vendors
router.get('/search', vendorPublicController.searchVendors);

// Get vendor by ID
router.get('/:id', vendorPublicController.getVendorById);

// Get vendor reviews
router.get('/:id/reviews', vendorPublicController.getVendorReviews);

module.exports = router;