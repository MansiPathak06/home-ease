const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isUser } = require('../middleware/auth');

router.use(verifyToken, isUser);

router.get('/profile',  userController.getProfile);
router.put('/profile',  userController.updateProfile);

router.get('/bookings',               userController.getBookings);
router.post('/bookings',              userController.createBooking);
router.put('/bookings/:id/cancel',    userController.cancelBooking);
router.post('/bookings/:id/quote-response', userController.respondToQuote); // ← NEW

router.get('/favorites',              userController.getFavorites);
router.post('/favorites',             userController.addFavorite);
router.delete('/favorites/:vendorId', userController.removeFavorite);

router.post('/reviews', userController.addReview);

module.exports = router;