const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ─── PUBLIC (no auth needed) ──────────────────────────────────────────────────
// Anyone can submit a testimonial review
router.post('/submit', reviewController.submitReview);

// Fetch all approved reviews (for homepage display)
router.get('/public', reviewController.getPublicReviews);

// ─── ADMIN (auth required) ────────────────────────────────────────────────────
router.get('/admin', verifyToken, isAdmin, reviewController.getAllReviews);
router.patch('/admin/:id/approve', verifyToken, isAdmin, reviewController.approveReview);
router.delete('/admin/:id', verifyToken, isAdmin, reviewController.deleteReview);
router.post('/admin', verifyToken, isAdmin, reviewController.addReviewByAdmin);

module.exports = router;