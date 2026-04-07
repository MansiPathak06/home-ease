const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User routes
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);

// Vendor routes
router.post('/vendor/login', authController.loginVendor);
router.post('/vendor/register', authController.registerVendor);

module.exports = router;