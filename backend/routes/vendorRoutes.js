const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const { verifyToken, isVendor } = require("../middleware/auth");

router.use(verifyToken, isVendor);

router.get("/profile",  vendorController.getProfile);
router.put("/profile",  vendorController.updateProfile);

router.get("/bookings",                    vendorController.getBookings);
router.get("/bookings/check-conflict",     vendorController.checkTimeConflict);
router.get("/bookings/:id",                vendorController.getSingleBooking);
router.put("/bookings/:id",                vendorController.updateBookingStatus);

// ── NEW: Quote + Payment ─────────────────────────────────────
router.post("/bookings/:id/quote",         vendorController.sendPriceQuote);      // vendor sends price
router.post("/bookings/:id/final-payment", vendorController.updateFinalPayment);  // vendor records payment

router.get("/reviews",  vendorController.getReviews);
router.get("/services", vendorController.getServices);
router.get("/stats",    vendorController.getStats);

module.exports = router;