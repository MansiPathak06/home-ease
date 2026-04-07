const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const { verifyToken, isVendor } = require("../middleware/auth");

// All vendor routes require authentication and vendor role
router.use(verifyToken, isVendor);

// Profile routes
router.get("/profile", vendorController.getProfile);
router.put("/profile", vendorController.updateProfile);

// Booking routes
router.get("/bookings", vendorController.getBookings);
router.get('/bookings/:id', vendorController.getSingleBooking);
router.put("/bookings/:id", vendorController.updateBookingStatus);


// Review routes
router.get("/reviews", vendorController.getReviews);

// Service routes
router.get("/services", vendorController.getServices);

// Stats routes
router.get("/stats", vendorController.getStats);



module.exports = router;