const { pool } = require('../config/db');

// GET ALL VENDORS
exports.getAllVendors = async (req, res) => {
  try {
    const [vendors] = await pool.query(
      `SELECT id, business_name, owner_name, email, phone, address, city, state, 
       zip_code, service_category, services_offered, description, years_in_business, 
       pricing, availability, website, certification, is_approved, created_at 
       FROM vendors 
       ORDER BY created_at DESC`
    );

    res.json(vendors);

  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, phone, location, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE VENDOR
exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Update vendor approval status
    const [result] = await pool.query(
      'UPDATE vendors SET is_approved = true WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor details for notification (optional)
    const [vendor] = await pool.query(
      'SELECT email, business_name FROM vendors WHERE id = ?',
      [id]
    );

    // TODO: Send approval email to vendor
    // await sendApprovalEmail(vendor[0].email, vendor[0].business_name);

    res.json({
      success: true,
      message: 'Vendor approved successfully'
    });

  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// REJECT VENDOR
exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Get vendor details before deletion
    const [vendor] = await pool.query(
      'SELECT email, business_name FROM vendors WHERE id = ?',
      [id]
    );

    if (vendor.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Delete vendor
    await pool.query('DELETE FROM vendors WHERE id = ?', [id]);

    // TODO: Send rejection email
    // await sendRejectionEmail(vendor[0].email, vendor[0].business_name);

    res.json({
      success: true,
      message: 'Vendor rejected'
    });

  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('deleteVendor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVendorStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        v.id                                              AS vendor_id,
        COUNT(b.id)                                       AS totalBookings,
        SUM(b.status = 'completed')                      AS completedJobs,
        SUM(b.status = 'cancelled')                      AS cancelledJobs,
        ROUND(
          SUM(b.status = 'cancelled') / NULLIF(COUNT(b.id), 0) * 100
        , 1)                                              AS cancelRate,
        COALESCE(AVG(r.rating), 0)                       AS avgRating,
        COALESCE(SUM(
          CASE WHEN b.status = 'completed' THEN b.vendor_payout ELSE 0 END
        ), 0)                                             AS totalEarnings
      FROM vendors v
      LEFT JOIN bookings b ON b.vendor_id = v.id
      LEFT JOIN reviews  r ON r.vendor_id = v.id
      GROUP BY v.id
    `);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('getVendorStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// BLOCK USER
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE users SET is_blocked = 1 WHERE id = ?', [id]
    );
    if (result.affectedRows === 0)
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
    await pool.query('UPDATE users SET is_blocked = 0 WHERE id = ?', [id]);
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
    // Delete bookings first to avoid FK constraint errors
    await pool.query('DELETE FROM bookings WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM favorites WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM reviews WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// RESET USER PASSWORD (admin sets a new plain password)
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('resetUserPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total vendors
    const [totalVendors] = await pool.query(
      'SELECT COUNT(*) as count FROM vendors'
    );

    // Get pending vendors
    const [pendingVendors] = await pool.query(
      'SELECT COUNT(*) as count FROM vendors WHERE is_approved = false'
    );

    // Get approved vendors
    const [approvedVendors] = await pool.query(
      'SELECT COUNT(*) as count FROM vendors WHERE is_approved = true'
    );

    // Get total users
    const [totalUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get total bookings
    const [totalBookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings'
    );

    res.json({
      totalVendors: totalVendors[0].count,
      pendingVendors: pendingVendors[0].count,
      approvedVendors: approvedVendors[0].count,
      totalUsers: totalUsers[0].count,
      totalBookings: totalBookings[0].count
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};