const { pool } = require('../config/db');

// GET ALL VENDORS
exports.getAllVendors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, business_name, owner_name, email, phone, address, city, state,
       zip_code, service_category, services_offered, description, years_in_business,
       pricing, availability, website, certification, is_approved, created_at
       FROM vendors
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, location, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE VENDOR
exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE vendors SET is_approved = true WHERE id = $1',
      [id]
    );

    // PostgreSQL uses rowCount instead of affectedRows
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ success: true, message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// REJECT VENDOR
exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await pool.query(
      'SELECT email, business_name FROM vendors WHERE id = $1',
      [id]
    );

    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await pool.query('DELETE FROM vendors WHERE id = $1', [id]);

    res.json({ success: true, message: 'Vendor rejected' });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE VENDOR
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vendors WHERE id = $1', [id]);
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('deleteVendor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET VENDOR STATS
exports.getVendorStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.id                                                          AS vendor_id,
        COUNT(b.id)                                                   AS "totalBookings",
        COUNT(b.id) FILTER (WHERE b.status = 'completed')            AS "completedJobs",
        COUNT(b.id) FILTER (WHERE b.status = 'cancelled')            AS "cancelledJobs",
        ROUND(
          COUNT(b.id) FILTER (WHERE b.status = 'cancelled')::NUMERIC
          / NULLIF(COUNT(b.id), 0) * 100
        , 1)                                                          AS "cancelRate",
        COALESCE(AVG(r.rating), 0)                                    AS "avgRating",
        COALESCE(SUM(b.vendor_payout) FILTER (WHERE b.status = 'completed'), 0) AS "totalEarnings"
      FROM vendors v
      LEFT JOIN bookings b ON b.vendor_id = v.id
      LEFT JOIN reviews  r ON r.vendor_id = v.id
      GROUP BY v.id
    `);

    res.json({ success: true, stats: result.rows });
  } catch (err) {
    console.error('getVendorStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// BLOCK USER
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE users SET is_blocked = 1 WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User blocked successfully' });
  } catch (err) {
    console.error('blockUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UNBLOCK USER
exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_blocked = 0 WHERE id = $1', [id]);
    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (err) {
    console.error('unblockUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete related records first to avoid FK constraint errors
    await pool.query('DELETE FROM bookings  WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM favorites WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM reviews   WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM users     WHERE id      = $1', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// RESET USER PASSWORD
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('resetUserPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    // Run all in parallel
    const [totalVendors, pendingVendors, approvedVendors, totalUsers, totalBookings] =
      await Promise.all([
        pool.query('SELECT COUNT(*) AS count FROM vendors'),
        pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved = false'),
        pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved = true'),
        pool.query('SELECT COUNT(*) AS count FROM users'),
        pool.query('SELECT COUNT(*) AS count FROM bookings'),
      ]);

    res.json({
      totalVendors:    parseInt(totalVendors.rows[0].count),
      pendingVendors:  parseInt(pendingVendors.rows[0].count),
      approvedVendors: parseInt(approvedVendors.rows[0].count),
      totalUsers:      parseInt(totalUsers.rows[0].count),
      totalBookings:   parseInt(totalBookings.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};