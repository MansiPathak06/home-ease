const { pool } = require('../config/db');

// GET VENDOR PROFILE
exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId; // From JWT token

    const [vendors] = await pool.query(
      `SELECT id, business_name, owner_name, email, phone, address, city, state, 
       zip_code, service_category, services_offered, description, years_in_business, 
       pricing, availability, website, certification, is_approved 
       FROM vendors WHERE id = ?`,
      [vendorId]
    );

    if (vendors.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendors[0]); // Return vendor object directly

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
      businessName,
      ownerName,
      phone,
      address,
      city,
      state,
      zipCode,
      servicesOffered,
      description,
      pricing,
      availability,
      website,
      certification
    } = req.body;

    await pool.query(
      `UPDATE vendors SET 
       business_name = ?, owner_name = ?, phone = ?, address = ?, 
       city = ?, state = ?, zip_code = ?, services_offered = ?, 
       description = ?, pricing = ?, availability = ?, website = ?, 
       certification = ? 
       WHERE id = ?`,
      [
        businessName, ownerName, phone, address, city, state, zipCode,
        servicesOffered, description, pricing, availability, website,
        certification, vendorId
      ]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR BOOKINGS (returns array directly)
exports.getBookings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId; // From JWT token

    const [bookings] = await pool.query(
      `SELECT b.*, 
              u.name as customer_name, 
              u.email as customer_email, 
              u.phone as customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.vendor_id = ?
       ORDER BY b.created_at DESC`,
      [vendorId]
    );

    console.log('✅ Found bookings for vendor:', vendorId, '- Count:', bookings.length);

    res.json(bookings); // Return array directly

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE BOOKING STATUS
// UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vendor_response, new_date, new_time, service_notes } = req.body;
    const vendorId = req.user.vendorId;

    console.log('📝 Updating booking:', { id, status, vendorId });

    // Verify booking belongs to this vendor
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND vendor_id = ?',
      [id, vendorId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Validate status transitions
    const current = bookings[0].status;
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

    // Build dynamic update — only set fields that were actually sent
    const fields = ['updated_at = CURRENT_TIMESTAMP'];
    const values = [];

    if (status)          { fields.push('status = ?');          values.push(status); }
    if (vendor_response !== undefined) { fields.push('vendor_response = ?'); values.push(vendor_response || null); }
    if (new_date)        { fields.push('new_date = ?');        values.push(new_date); }
    if (new_time)        { fields.push('new_time = ?');        values.push(new_time); }
    if (service_notes !== undefined) { fields.push('service_notes = ?'); values.push(service_notes || null); }

    values.push(id); // for WHERE clause

    await pool.query(
      `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    console.log('✅ Booking updated successfully');

    res.json({
      success: true,
      message: status ? `Booking ${status} successfully` : 'Booking notes updated'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET VENDOR REVIEWS
exports.getReviews = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as customer_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [vendorId]
    );

    res.json(reviews); // Return array directly

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR SERVICES
exports.getServices = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const services = [];
    res.json(services);

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR STATS
/**
 * GET VENDOR STATS
 * Return vendor stats: total bookings, pending bookings, completed bookings, total revenue, average rating
 */
exports.getStats = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    // Total bookings
    // Get total bookings
    const [totalBookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE vendor_id = ?',
      [vendorId]
    );

    // Pending bookings
    // Get pending bookings
    const [pendingBookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE vendor_id = ? AND status = "pending"',
      [vendorId]
    );

    // Completed bookings
    // Get completed bookings
    const [completedBookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE vendor_id = ? AND status = "completed"',
      [vendorId]
    );

    // Total revenue
    // Get total revenue
    const [revenue] = await pool.query(
      'SELECT SUM(amount) as total FROM bookings WHERE vendor_id = ? AND status = "completed"',
      [vendorId]
    );

    // Average rating
    // Get average rating
    const [rating] = await pool.query(
      'SELECT AVG(rating) as avg FROM reviews WHERE vendor_id = ?',
      [vendorId]
    );

    res.json({
      totalBookings: totalBookings[0].count,
      // Total number of bookings
      pendingBookings: pendingBookings[0].count,
      // Number of bookings in pending status
      completedBookings: completedBookings[0].count,
      // Number of bookings in completed status
      totalRevenue: revenue[0].total || 0,
      // Total amount of money earned from completed bookings
      averageRating: rating[0].avg || 0
      // Average rating of vendor from reviews
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET SINGLE BOOKING for tracking page
exports.getSingleBooking = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    const [bookings] = await pool.query(
      `SELECT b.*, 
              u.name AS customer_name, 
              u.email AS customer_email, 
              u.phone AS customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ? AND b.vendor_id = ?`,
      [id, vendorId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error('Error fetching single booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};