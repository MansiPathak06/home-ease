const express = require('express');
const router  = express.Router();
const { createLead, getAllLeads, deleteLead } = require('../controllers/societyLeadController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST   /api/society-leads            → public (anyone can enquire)
router.post('/', createLead);

// GET    /api/society-leads/admin      → admin only
router.get('/admin', verifyToken, isAdmin, getAllLeads);

// DELETE /api/society-leads/admin/:id  → admin only
router.delete('/admin/:id', verifyToken, isAdmin, deleteLead);

module.exports = router;