const { pool } = require('../config/db');

// GET ALL BOOKINGS (with filters)
exports.getBookings = async (req, res) => {
  try {
    const { vendorId, status, paymentMethod, dateFrom, dateTo, search } = req.query;

    let sql = `
      SELECT
        b.*,
        u.name          AS user_name,
        u.email         AS user_email,
        u.phone         AS user_phone,
        v.business_name AS vendor_name,
        v.service_category
      FROM bookings b
      LEFT JOIN users   u ON b.user_id   = u.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (vendorId)       { sql += ` AND b.vendor_id = $${idx++}`;        params.push(vendorId); }
    if (status)         { sql += ` AND b.status = $${idx++}`;           params.push(status); }
    if (paymentMethod)  { sql += ` AND b.payment_method = $${idx++}`;   params.push(paymentMethod); }
    if (dateFrom)       { sql += ` AND b.date >= $${idx++}`;            params.push(dateFrom); }
    if (dateTo)         { sql += ` AND b.date <= $${idx++}`;            params.push(dateTo); }
    if (search) {
      sql += ` AND (
        u.name          ILIKE $${idx}   OR
        v.business_name ILIKE $${idx+1} OR
        b.service_name  ILIKE $${idx+2} OR
        b.id            ILIKE $${idx+3}
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
      idx += 4;
    }

    sql += ' ORDER BY b.created_at DESC';

    const result = await pool.query(sql, params);
    res.json({ success: true, bookings: result.rows });

  } catch (err) {
    console.error('Admin getBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET SINGLE BOOKING
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        b.*,
        u.name          AS user_name,
        u.email         AS user_email,
        u.phone         AS user_phone,
        v.business_name AS vendor_name,
        v.service_category,
        v.phone         AS vendor_phone
      FROM bookings b
      LEFT JOIN users   u ON b.user_id   = u.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = $1
    `, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking: result.rows[0] });

  } catch (err) {
    console.error('Admin getBookingById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE BOOKING
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, vendor_id, new_date, new_time,
      service_price, commission_pct, payout_status,
      admin_notes, cancelled_by
    } = req.body;

    const current = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const row = current.rows[0];

    const fields = ['updated_at = CURRENT_TIMESTAMP'];
    const values = [];
    let idx = 1;

    if (status        !== undefined) { fields.push(`status = $${idx++}`);        values.push(status); }
    if (vendor_id     !== undefined) { fields.push(`vendor_id = $${idx++}`);     values.push(vendor_id); }
    if (new_date      !== undefined) { fields.push(`new_date = $${idx++}`);      values.push(new_date); }
    if (new_time      !== undefined) { fields.push(`new_time = $${idx++}`);      values.push(new_time); }
    if (admin_notes   !== undefined) { fields.push(`admin_notes = $${idx++}`);   values.push(admin_notes); }
    if (cancelled_by  !== undefined) { fields.push(`cancelled_by = $${idx++}`);  values.push(cancelled_by); }
    if (payout_status !== undefined) { fields.push(`payout_status = $${idx++}`); values.push(payout_status); }

    if (service_price !== undefined) {
      const price  = parseFloat(service_price);
      const pct    = parseFloat(commission_pct ?? row.commission_pct ?? 15);
      const payout = price * (1 - pct / 100);
      fields.push(`service_price = $${idx++}`, `commission_pct = $${idx++}`, `vendor_payout = $${idx++}`);
      values.push(price, pct, payout);
    } else if (commission_pct !== undefined) {
      const price  = parseFloat(row.service_price ?? 0);
      const pct    = parseFloat(commission_pct);
      const payout = price * (1 - pct / 100);
      fields.push(`commission_pct = $${idx++}`, `vendor_payout = $${idx++}`);
      values.push(pct, payout);
    }

    values.push(id);
    await pool.query(
      `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    res.json({ success: true, message: 'Booking updated successfully' });

  } catch (err) {
    console.error('Admin updateBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ASSIGN VENDOR TO BOOKING
exports.assignVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.status(400).json({ success: false, message: 'vendor_id is required' });
    }

    // PostgreSQL uses true not 1 for booleans
    const vendor = await pool.query(
      'SELECT id, business_name FROM vendors WHERE id = $1 AND is_approved = true',
      [vendor_id]
    );
    if (!vendor.rows.length) {
      return res.status(404).json({ success: false, message: 'Vendor not found or not approved' });
    }

    await pool.query(
      'UPDATE bookings SET vendor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [vendor_id, id]
    );

    res.json({
      success: true,
      message: `Vendor "${vendor.rows[0].business_name}" assigned successfully`
    });

  } catch (err) {
    console.error('Admin assignVendor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET BOOKING STATS
exports.getBookingStats = async (req, res) => {
  try {
    // PostgreSQL uses FILTER instead of SUM(condition = value)
    const result = await pool.query(`
      SELECT
        COUNT(*)                                                            AS "totalBookings",
        COUNT(*) FILTER (WHERE status = 'pending')                         AS pending,
        COUNT(*) FILTER (WHERE status = 'approved')                        AS approved,
        COUNT(*) FILTER (WHERE status = 'completed')                       AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')                       AS cancelled,
        COUNT(*) FILTER (WHERE status = 'rejected')                        AS rejected,
        COALESCE(SUM(service_price), 0)                                    AS "totalRevenue",
        COALESCE(SUM(vendor_payout), 0)                                    AS "totalVendorPayout",
        COALESCE(SUM(service_price) - SUM(vendor_payout), 0)              AS "totalAdminEarnings",
        COUNT(*) FILTER (WHERE payout_status = 'pending')                  AS "payoutPending",
        COUNT(*) FILTER (WHERE payout_status = 'paid')                     AS "payoutPaid",
        COUNT(*) FILTER (WHERE payment_method = 'online')                  AS "onlinePayments",
        COUNT(*) FILTER (WHERE payment_method = 'cod')                     AS "codPayments"
      FROM bookings
    `);

    res.json({ success: true, stats: result.rows[0] });

  } catch (err) {
    console.error('Admin getBookingStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET APPROVED VENDORS LIST (for dropdown)
exports.getApprovedVendorsList = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, business_name, service_category, city FROM vendors WHERE is_approved = true ORDER BY business_name ASC'
    );
    res.json({ success: true, vendors: result.rows });
  } catch (err) {
    console.error('getApprovedVendorsList error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};