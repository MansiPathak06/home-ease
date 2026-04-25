const { pool } = require('../config/db');

// ─── POST /api/society-leads ─────────────────────────────────────────────────
const createLead = async (req, res) => {
  try {
    const { name, society_name, phone, city } = req.body;

    if (!name || !society_name || !phone || !city) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian phone number.' });
    }

    const result = await pool.query(
      `INSERT INTO society_leads (name, society_name, phone, city, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [name.trim(), society_name.trim(), phone.trim(), city.trim()]
    );

    return res.status(201).json({
      message: 'Enquiry submitted successfully! Our team will contact you shortly.',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('createLead error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── GET /api/society-leads/admin ────────────────────────────────────────────
const getAllLeads = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, society_name, phone, city, created_at
       FROM society_leads
       ORDER BY created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllLeads error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── DELETE /api/society-leads/admin/:id ─────────────────────────────────────
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id FROM society_leads WHERE id = $1', [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    await pool.query('DELETE FROM society_leads WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    console.error('deleteLead error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { createLead, getAllLeads, deleteLead };