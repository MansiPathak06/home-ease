const { pool } = require('../config/db');

// ─── PUBLIC: Submit a review (user fills form on site) ───────────────────────
exports.submitReview = async (req, res) => {
  try {
    const { name, email, rating, text, service } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({ message: 'Name, rating, and review text are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Use existing reviews table — insert with is_approved = false (pending admin approval)
    // We store in customer_name, comment columns to match your existing schema
    await pool.query(
      `INSERT INTO reviews (id, customer_name, email, rating, comment, service, is_approved, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
      [
        Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        email || null,
        rating,
        text,
        service || null,
      ]
    );

    res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted and is pending approval.' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUBLIC: Get approved reviews (for homepage) ─────────────────────────────
exports.getPublicReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, customer_name AS name, rating, comment AS text, service, created_at
       FROM reviews
       WHERE is_approved = true AND vendor_id IS NULL
       ORDER BY created_at DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADMIN: Get ALL reviews (approved + pending) ──────────────────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, customer_name AS name, email, rating, comment AS text, service, is_approved, created_at
       FROM reviews
       WHERE vendor_id IS NULL
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADMIN: Approve a review ──────────────────────────────────────────────────
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review approved successfully' });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADMIN: Delete a review ───────────────────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND vendor_id IS NULL RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADMIN: Add a review manually ────────────────────────────────────────────
exports.addReviewByAdmin = async (req, res) => {
  try {
    const { name, email, rating, text, service } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({ message: 'Name, rating, and review text are required.' });
    }

    await pool.query(
      `INSERT INTO reviews (id, customer_name, email, rating, comment, service, is_approved, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
      [
        Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        email || null,
        rating,
        text,
        service || null,
      ]
    );

    res.status(201).json({ success: true, message: 'Review added and published successfully.' });
  } catch (error) {
    console.error('Error adding review by admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};