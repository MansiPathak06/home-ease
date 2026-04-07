const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isUser } = require('../middleware/auth');

// All user routes require authentication and user role
router.use(verifyToken, isUser);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Bookings
router.get('/bookings', userController.getBookings);
router.post('/bookings', userController.createBooking);
router.put('/bookings/:id/cancel', userController.cancelBooking);

// Favorites
router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:vendorId', userController.removeFavorite);

// Reviews
router.post('/reviews', userController.addReview);


module.exports = router;