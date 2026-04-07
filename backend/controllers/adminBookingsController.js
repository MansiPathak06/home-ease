const { pool } = require('../config/db');

// ─── GET ALL BOOKINGS (with filters) ────────────────────────────────────────
exports.getBookings = async (req, res) => {
  try {
    const { vendorId, status, paymentMethod, dateFrom, dateTo, search } = req.query;

    let sql = `
      SELECT 
        b.*,
        u.name        AS user_name,
        u.email       AS user_email,
        u.phone       AS user_phone,
        v.business_name AS vendor_name,
        v.service_category
      FROM bookings b
      LEFT JOIN users   u ON b.user_id   = u.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (vendorId) {
      sql += ' AND b.vendor_id = ?';
      params.push(vendorId);
    }
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    if (paymentMethod) {
      sql += ' AND b.payment_method = ?';
      params.push(paymentMethod);
    }
    if (dateFrom) {
      sql += ' AND b.date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ' AND b.date <= ?';
      params.push(dateTo);
    }
    if (search) {
      sql += ` AND (
        u.name          LIKE ? OR
        v.business_name LIKE ? OR
        b.service_name  LIKE ? OR
        b.id            LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY b.created_at DESC';

    const [bookings] = await pool.query(sql, params);
    res.json({ success: true, bookings });

  } catch (err) {
    console.error('Admin getBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET SINGLE BOOKING ──────────────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        b.*,
        u.name        AS user_name,
        u.email       AS user_email,
        u.phone       AS user_phone,
        v.business_name AS vendor_name,
        v.service_category,
        v.phone       AS vendor_phone
      FROM bookings b
      LEFT JOIN users   u ON b.user_id   = u.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking: rows[0] });

  } catch (err) {
    console.error('Admin getBookingById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── UPDATE BOOKING (admin: status, reschedule, assign vendor, payout) ───────
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      vendor_id,
      new_date,
      new_time,
      service_price,
      commission_pct,
      payout_status,
      admin_notes,
      cancelled_by
    } = req.body;

    // Fetch current booking
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const fields = ['updated_at = CURRENT_TIMESTAMP'];
    const values = [];

    if (status)         { fields.push('status = ?');         values.push(status); }
    if (vendor_id)      { fields.push('vendor_id = ?');      values.push(vendor_id); }
    if (new_date)       { fields.push('new_date = ?');        values.push(new_date); }
    if (new_time)       { fields.push('new_time = ?');        values.push(new_time); }
    if (admin_notes !== undefined) { fields.push('admin_notes = ?'); values.push(admin_notes); }
    if (cancelled_by)   { fields.push('cancelled_by = ?');   values.push(cancelled_by); }
    if (payout_status)  { fields.push('payout_status = ?');  values.push(payout_status); }

    // Recalculate payout when price/commission changes
    if (service_price !== undefined) {
      const price  = parseFloat(service_price);
      const pct    = parseFloat(commission_pct ?? rows[0].commission_pct ?? 15);
      const payout = price * (1 - pct / 100);
      fields.push('service_price = ?',  'commission_pct = ?', 'vendor_payout = ?');
      values.push(price, pct, payout);
    } else if (commission_pct !== undefined) {
      const price  = parseFloat(rows[0].service_price ?? 0);
      const pct    = parseFloat(commission_pct);
      const payout = price * (1 - pct / 100);
      fields.push('commission_pct = ?', 'vendor_payout = ?');
      values.push(pct, payout);
    }

    values.push(id);
    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Booking updated successfully' });

  } catch (err) {
    console.error('Admin updateBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── ASSIGN VENDOR TO BOOKING ────────────────────────────────────────────────
exports.assignVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.status(400).json({ success: false, message: 'vendor_id is required' });
    }

    // Verify vendor exists and is approved
    const [vendors] = await pool.query(
      'SELECT id, business_name FROM vendors WHERE id = ? AND is_approved = 1',
      [vendor_id]
    );
    if (!vendors.length) {
      return res.status(404).json({ success: false, message: 'Vendor not found or not approved' });
    }

    await pool.query(
      'UPDATE bookings SET vendor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [vendor_id, id]
    );

    res.json({
      success: true,
      message: `Vendor "${vendors[0].business_name}" assigned successfully`
    });

  } catch (err) {
    console.error('Admin assignVendor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET BOOKING STATS (summary for dashboard) ───────────────────────────────
exports.getBookingStats = async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*)                                          AS totalBookings,
        SUM(status = 'pending')                          AS pending,
        SUM(status = 'approved')                         AS approved,
        SUM(status = 'completed')                        AS completed,
        SUM(status = 'cancelled')                        AS cancelled,
        SUM(status = 'rejected')                         AS rejected,
        COALESCE(SUM(service_price), 0)                  AS totalRevenue,
        COALESCE(SUM(vendor_payout), 0)                  AS totalVendorPayout,
        COALESCE(SUM(service_price) - SUM(vendor_payout), 0) AS totalAdminEarnings,
        SUM(payout_status = 'pending')                   AS payoutPending,
        SUM(payout_status = 'paid')                      AS payoutPaid,
        SUM(payment_method = 'online')                   AS onlinePayments,
        SUM(payment_method = 'cod')                      AS codPayments
      FROM bookings
    `);

    res.json({ success: true, stats: totals });

  } catch (err) {
    console.error('Admin getBookingStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET ALL APPROVED VENDORS (for assign-vendor dropdown) ──────────────────
exports.getApprovedVendorsList = async (req, res) => {
  try {
    const [vendors] = await pool.query(
      'SELECT id, business_name, service_category, city FROM vendors WHERE is_approved = 1 ORDER BY business_name ASC'
    );
    res.json({ success: true, vendors });
  } catch (err) {
    console.error('getApprovedVendorsList error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};