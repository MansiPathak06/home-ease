const { pool } = require('../config/db');

// GET VENDOR PROFILE
exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const result = await pool.query(
      `SELECT id, business_name, owner_name, email, phone, address, city, state,
       zip_code, service_category, services_offered, description, years_in_business,
       pricing, availability, website, certification, is_approved
       FROM vendors WHERE id = $1`,
      [vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE VENDOR PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const {
      businessName, ownerName, phone, address, city, state,
      zipCode, servicesOffered, description, pricing,
      availability, website, certification
    } = req.body;

    await pool.query(
      `UPDATE vendors SET
       business_name = $1, owner_name = $2, phone = $3, address = $4,
       city = $5, state = $6, zip_code = $7, services_offered = $8,
       description = $9, pricing = $10, availability = $11, website = $12,
       certification = $13
       WHERE id = $14`,
      [
        businessName, ownerName, phone, address, city, state,
        zipCode, servicesOffered, description, pricing,
        availability, website, certification, vendorId
      ]
    );

    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR BOOKINGS
exports.getBookings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const result = await pool.query(
      `SELECT b.*,
              u.name  AS customer_name,
              u.email AS customer_email,
              u.phone AS customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.vendor_id = $1
       ORDER BY b.created_at DESC`,
      [vendorId]
    );

    console.log('✅ Found bookings for vendor:', vendorId, '- Count:', result.rows.length);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vendor_response, new_date, new_time, service_notes } = req.body;
    const vendorId = req.user.vendorId;

    console.log('📝 Updating booking:', { id, status, vendorId });

    const check = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    const current = check.rows[0].status;
    const allowedTransitions = {
      pending:     ['approved', 'rejected', 'rescheduled'],
      approved:    ['completed', 'rejected', 'rescheduled'],
      rescheduled: ['approved', 'rejected'],
      completed:   [],
      rejected:    [],
    };

    if (status && !allowedTransitions[current]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${current}" to "${status}"`
      });
    }

    // Build dynamic update with $N placeholders
    const fields = ['updated_at = CURRENT_TIMESTAMP'];
    const values = [];
    let idx = 1;

    if (status !== undefined)          { fields.push(`status = $${idx++}`);           values.push(status); }
    if (vendor_response !== undefined) { fields.push(`vendor_response = $${idx++}`);  values.push(vendor_response || null); }
    if (new_date !== undefined)        { fields.push(`new_date = $${idx++}`);         values.push(new_date); }
    if (new_time !== undefined)        { fields.push(`new_time = $${idx++}`);         values.push(new_time); }
    if (service_notes !== undefined)   { fields.push(`service_notes = $${idx++}`);    values.push(service_notes || null); }

    values.push(id); // final value for WHERE clause

    await pool.query(
      `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    console.log('✅ Booking updated successfully');
    res.json({
      success: true,
      message: status ? `Booking ${status} successfully` : 'Booking notes updated'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET VENDOR REVIEWS
exports.getReviews = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const result = await pool.query(
      `SELECT r.*, u.name AS customer_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [vendorId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR SERVICES
exports.getServices = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR STATS
exports.getStats = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    // Run all queries in parallel for efficiency
    const [total, pending, completed, revenue, rating] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM bookings WHERE vendor_id = $1', [vendorId]),
      pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id = $1 AND status = 'pending'`, [vendorId]),
      pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id = $1 AND status = 'completed'`, [vendorId]),
      pool.query(`SELECT SUM(amount) AS total FROM bookings WHERE vendor_id = $1 AND status = 'completed'`, [vendorId]),
      pool.query('SELECT AVG(rating) AS avg FROM reviews WHERE vendor_id = $1', [vendorId]),
    ]);

    res.json({
      totalBookings:     parseInt(total.rows[0].count),
      pendingBookings:   parseInt(pending.rows[0].count),
      completedBookings: parseInt(completed.rows[0].count),
      totalRevenue:      parseFloat(revenue.rows[0].total) || 0,
      averageRating:     parseFloat(rating.rows[0].avg)   || 0,
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET SINGLE BOOKING
exports.getSingleBooking = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*,
              u.name  AS customer_name,
              u.email AS customer_email,
              u.phone AS customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = $1 AND b.vendor_id = $2`,
      [id, vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching single booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};