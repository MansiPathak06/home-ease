const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, isUser } = require('../middleware/auth');

router.use(verifyToken, isUser);

router.post('/create-order', paymentController.createOrder);
router.post('/verify',       paymentController.verifyPayment);

module.exports = router;