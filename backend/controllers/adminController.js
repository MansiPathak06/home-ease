// const { pool } = require('../config/db');

// // GET ALL VENDORS
// exports.getAllVendors = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, business_name, owner_name, email, phone, address, city, state,
//        zip_code, service_category, services_offered, description, years_in_business,
//        pricing, availability, website, certification, is_approved, created_at
//        FROM vendors
//        ORDER BY created_at DESC`
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching vendors:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET ALL USERS
// exports.getAllUsers = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, name, email, phone, location, created_at
//        FROM users
//        ORDER BY created_at DESC`
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // APPROVE VENDOR
// exports.approveVendor = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       'UPDATE vendors SET is_approved = true WHERE id = $1',
//       [id]
//     );

//     // PostgreSQL uses rowCount instead of affectedRows
//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: 'Vendor not found' });
//     }

//     res.json({ success: true, message: 'Vendor approved successfully' });
//   } catch (error) {
//     console.error('Error approving vendor:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // REJECT VENDOR
// exports.rejectVendor = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const vendor = await pool.query(
//       'SELECT email, business_name FROM vendors WHERE id = $1',
//       [id]
//     );

//     if (vendor.rows.length === 0) {
//       return res.status(404).json({ message: 'Vendor not found' });
//     }

//     await pool.query('DELETE FROM vendors WHERE id = $1', [id]);

//     res.json({ success: true, message: 'Vendor rejected' });
//   } catch (error) {
//     console.error('Error rejecting vendor:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // DELETE VENDOR
// exports.deleteVendor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query('DELETE FROM vendors WHERE id = $1', [id]);
//     res.json({ success: true, message: 'Vendor deleted successfully' });
//   } catch (err) {
//     console.error('deleteVendor error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // GET VENDOR STATS
// exports.getVendorStats = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT
//         v.id                                                          AS vendor_id,
//         COUNT(b.id)                                                   AS "totalBookings",
//         COUNT(b.id) FILTER (WHERE b.status = 'completed')            AS "completedJobs",
//         COUNT(b.id) FILTER (WHERE b.status = 'cancelled')            AS "cancelledJobs",
//         ROUND(
//           COUNT(b.id) FILTER (WHERE b.status = 'cancelled')::NUMERIC
//           / NULLIF(COUNT(b.id), 0) * 100
//         , 1)                                                          AS "cancelRate",
//         COALESCE(AVG(r.rating), 0)                                    AS "avgRating",
//         COALESCE(SUM(b.vendor_payout) FILTER (WHERE b.status = 'completed'), 0) AS "totalEarnings"
//       FROM vendors v
//       LEFT JOIN bookings b ON b.vendor_id = v.id
//       LEFT JOIN reviews  r ON r.vendor_id = v.id
//       GROUP BY v.id
//     `);

//     res.json({ success: true, stats: result.rows });
//   } catch (err) {
//     console.error('getVendorStats error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // BLOCK USER
// exports.blockUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       'UPDATE users SET is_blocked = 1 WHERE id = $1',
//       [id]
//     );
//     if (result.rowCount === 0)
//       return res.status(404).json({ success: false, message: 'User not found' });
//     res.json({ success: true, message: 'User blocked successfully' });
//   } catch (err) {
//     console.error('blockUser error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // UNBLOCK USER
// exports.unblockUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query('UPDATE users SET is_blocked = 0 WHERE id = $1', [id]);
//     res.json({ success: true, message: 'User unblocked successfully' });
//   } catch (err) {
//     console.error('unblockUser error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // DELETE USER
// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // Delete related records first to avoid FK constraint errors
//     await pool.query('DELETE FROM bookings  WHERE user_id = $1', [id]);
//     await pool.query('DELETE FROM favorites WHERE user_id = $1', [id]);
//     await pool.query('DELETE FROM reviews   WHERE user_id = $1', [id]);
//     await pool.query('DELETE FROM users     WHERE id      = $1', [id]);
//     res.json({ success: true, message: 'User deleted successfully' });
//   } catch (err) {
//     console.error('deleteUser error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // RESET USER PASSWORD
// exports.resetUserPassword = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { newPassword } = req.body;

//     if (!newPassword || newPassword.length < 6)
//       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

//     const bcrypt = require('bcryptjs');
//     const hashed = await bcrypt.hash(newPassword, 10);

//     await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
//     res.json({ success: true, message: 'Password reset successfully' });
//   } catch (err) {
//     console.error('resetUserPassword error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // GET DASHBOARD STATS
// exports.getDashboardStats = async (req, res) => {
//   try {
//     // Run all in parallel
//     const [totalVendors, pendingVendors, approvedVendors, totalUsers, totalBookings] =
//       await Promise.all([
//         pool.query('SELECT COUNT(*) AS count FROM vendors'),
//         pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved = false'),
//         pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved = true'),
//         pool.query('SELECT COUNT(*) AS count FROM users'),
//         pool.query('SELECT COUNT(*) AS count FROM bookings'),
//       ]);

//     res.json({
//       totalVendors:    parseInt(totalVendors.rows[0].count),
//       pendingVendors:  parseInt(pendingVendors.rows[0].count),
//       approvedVendors: parseInt(approvedVendors.rows[0].count),
//       totalUsers:      parseInt(totalUsers.rows[0].count),
//       totalBookings:   parseInt(totalBookings.rows[0].count),
//     });
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const { pool } = require('../config/db');

exports.getAllVendors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,business_name,owner_name,email,phone,address,city,state,zip_code,
       service_category,services_offered,description,years_in_business,pricing,
       availability,website,certification,is_approved,created_at FROM vendors ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,name,email,phone,location,created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE vendors SET is_approved=true WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ success: true, message: 'Vendor approved' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await pool.query('SELECT email,business_name FROM vendors WHERE id=$1', [id]);
    if (vendor.rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });
    await pool.query('DELETE FROM vendors WHERE id=$1', [id]);
    res.json({ success: true, message: 'Vendor rejected' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vendors WHERE id=$1', [id]);
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getVendorStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id AS vendor_id,
        COUNT(b.id) AS "totalBookings",
        COUNT(b.id) FILTER (WHERE b.status='completed') AS "completedJobs",
        COUNT(b.id) FILTER (WHERE b.status='cancelled') AS "cancelledJobs",
        ROUND(COUNT(b.id) FILTER (WHERE b.status='cancelled')::NUMERIC/NULLIF(COUNT(b.id),0)*100,1) AS "cancelRate",
        COALESCE(AVG(r.rating),0) AS "avgRating",
        COALESCE(SUM(b.vendor_payout) FILTER (WHERE b.status='completed'),0) AS "totalEarnings"
      FROM vendors v LEFT JOIN bookings b ON b.vendor_id=v.id LEFT JOIN reviews r ON r.vendor_id=v.id GROUP BY v.id
    `);
    res.json({ success: true, stats: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE users SET is_blocked=1 WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User blocked' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_blocked=0 WHERE id=$1', [id]);
    res.json({ success: true, message: 'User unblocked' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bookings WHERE user_id=$1', [id]);
    await pool.query('DELETE FROM favorites WHERE user_id=$1', [id]);
    await pool.query('DELETE FROM reviews WHERE user_id=$1', [id]);
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params; const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be 6+ chars' });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, id]);
    res.json({ success: true, message: 'Password reset' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalVendors, pendingVendors, approvedVendors, totalUsers, totalBookings, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM vendors'),
      pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved=false'),
      pool.query('SELECT COUNT(*) AS count FROM vendors WHERE is_approved=true'),
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM bookings'),
      pool.query(`SELECT COALESCE(SUM(admin_earning),0) AS total FROM bookings WHERE final_payment_status='paid'`),
    ]);
    res.json({
      totalVendors:    parseInt(totalVendors.rows[0].count),
      pendingVendors:  parseInt(pendingVendors.rows[0].count),
      approvedVendors: parseInt(approvedVendors.rows[0].count),
      totalUsers:      parseInt(totalUsers.rows[0].count),
      totalBookings:   parseInt(totalBookings.rows[0].count),
      totalRevenue:    parseFloat(revenue.rows[0].total) || 0,
    });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

// ── PAYMENT MANAGEMENT ─────────────────────────────────────────────────────

// All bookings with payment info — for admin Payments tab
exports.getPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.date, b.time, b.status,
             b.quote_amount, b.quote_status, b.final_amount,
             b.final_payment_method, b.final_payment_status, b.final_paid_at,
             b.commission_pct, b.admin_earning, b.vendor_payout, b.payout_status,
             b.advance_amount, b.payment_method,
             u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             v.business_name AS vendor_name, v.email AS vendor_email, v.phone AS vendor_phone,
             b.service_name, b.created_at
      FROM bookings b
      LEFT JOIN users u ON b.user_id=u.id
      LEFT JOIN vendors v ON b.vendor_id=v.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

// Admin sets commission % for a booking (override)
exports.setCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_pct } = req.body;
    if (isNaN(commission_pct) || commission_pct < 0 || commission_pct > 100)
      return res.status(400).json({ success: false, message: 'Commission must be 0-100' });
    const check = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const bk = check.rows[0];
    const totalAmount  = Number(bk.final_amount || bk.quote_amount || bk.amount || 0);
    const adminEarning = Math.round((totalAmount * commission_pct) / 100);
    const vendorPayout = totalAmount - adminEarning;
    await pool.query(
      `UPDATE bookings SET commission_pct=$1, admin_earning=$2, vendor_payout=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4`,
      [commission_pct, adminEarning, vendorPayout, id]
    );
    res.json({ success: true, message: 'Commission updated', summary: { totalAmount, commission_pct, adminEarning, vendorPayout } });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

// Admin marks vendor payout as done
exports.markPayoutDone = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE bookings SET payout_status='paid', updated_at=CURRENT_TIMESTAMP WHERE id=$1`, [id]
    );
    res.json({ success: true, message: 'Payout marked as done' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

// Admin override: set commission globally for all future bookings
exports.setGlobalCommission = async (req, res) => {
  try {
    const { commission_pct } = req.body;
    if (isNaN(commission_pct) || commission_pct < 0 || commission_pct > 100)
      return res.status(400).json({ success: false, message: 'Must be 0-100' });
    // Update pending bookings' commission
    await pool.query(
      `UPDATE bookings SET commission_pct=$1 WHERE status NOT IN ('completed','cancelled','rejected')`, [commission_pct]
    );
    res.json({ success: true, message: `Global commission set to ${commission_pct}%` });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

// Summary: total admin earnings, vendor payouts, pending payouts
exports.getEarningsSummary = async (req, res) => {
  try {
    const [adminTotal, vendorTotal, pendingPayout, monthlyRevenue] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(admin_earning),0) AS total FROM bookings WHERE final_payment_status='paid'`),
      pool.query(`SELECT COALESCE(SUM(vendor_payout),0) AS total FROM bookings WHERE final_payment_status='paid'`),
      pool.query(`SELECT COALESCE(SUM(vendor_payout),0) AS total FROM bookings WHERE payout_status='pending' AND final_payment_status='paid'`),
      pool.query(`
        SELECT TO_CHAR(DATE_TRUNC('month',final_paid_at),'Mon YYYY') AS month,
               COALESCE(SUM(admin_earning),0) AS admin_earning,
               COALESCE(SUM(vendor_payout),0) AS vendor_payout,
               COUNT(*) AS transactions
        FROM bookings WHERE final_payment_status='paid'
        GROUP BY DATE_TRUNC('month',final_paid_at) ORDER BY DATE_TRUNC('month',final_paid_at) DESC LIMIT 6
      `),
    ]);
    res.json({
      adminTotalEarning:   parseFloat(adminTotal.rows[0].total) || 0,
      vendorTotalPayout:   parseFloat(vendorTotal.rows[0].total) || 0,
      pendingVendorPayout: parseFloat(pendingPayout.rows[0].total) || 0,
      monthlyRevenue:      monthlyRevenue.rows,
    });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};