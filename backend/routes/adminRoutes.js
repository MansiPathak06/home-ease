const express = require('express');
const router  = express.Router();
const adminController           = require('../controllers/adminController');
const adminBookingsController   = require('../controllers/adminBookingsController');
const adminCategoriesController = require('../controllers/adminCategoriesController');
const { verifyToken, isAdmin }  = require('../middleware/auth');

router.use(verifyToken, isAdmin);

// Vendor management
router.get('/vendors/stats',         adminController.getVendorStats);
router.get('/vendors',               adminController.getAllVendors);
router.post('/vendors/:id/approve',  adminController.approveVendor);
router.post('/vendors/:id/reject',   adminController.rejectVendor);
router.delete('/vendors/:id',        adminController.deleteVendor);

// User management
router.get('/users',                      adminController.getAllUsers);
router.put('/users/:id/block',            adminController.blockUser);
router.put('/users/:id/unblock',          adminController.unblockUser);
router.delete('/users/:id',              adminController.deleteUser);
router.put('/users/:id/reset-password',   adminController.resetUserPassword);

// Stats
router.get('/stats', adminController.getDashboardStats);

// Bookings
router.get('/bookings/stats',             adminBookingsController.getBookingStats);
router.get('/bookings/vendors-list',      adminBookingsController.getApprovedVendorsList);
router.get('/bookings',                   adminBookingsController.getBookings);
router.get('/bookings/:id',               adminBookingsController.getBookingById);
router.put('/bookings/:id',               adminBookingsController.updateBooking);
router.put('/bookings/:id/assign-vendor', adminBookingsController.assignVendor);

// Categories
router.get('/categories',     adminCategoriesController.getCategories);
router.post('/categories',    adminCategoriesController.createCategory);
router.put('/categories/:id', adminCategoriesController.updateCategory);
router.delete('/categories/:id', adminCategoriesController.deleteCategory);

// ── NEW: Payment management ──────────────────────────────────
router.get('/payments',                     adminController.getPayments);          // all bookings with payment info
router.get('/payments/summary',             adminController.getEarningsSummary);   // total earnings summary
router.put('/payments/:id/commission',      adminController.setCommission);        // override commission for booking
router.put('/payments/:id/payout-done',     adminController.markPayoutDone);       // mark vendor paid
router.put('/payments/global-commission',   adminController.setGlobalCommission);  // set % for all pending bookings

module.exports = router;