const { pool } = require('../config/db');

// Get vendor's bookings + stats
exports.getVendorBookings = async (req, res) => {
  try {
    const { vendorId } = req.query;

    const result = await pool.query(`
      SELECT b.*, 
             v.business_name AS vendor_name
      FROM bookings b 
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.vendor_id = $1
      ORDER BY b.created_at DESC
    `, [vendorId]);

    const bookings = result.rows;

    const stats = {
      totalBookings:     bookings.length,
      pendingBookings:   bookings.filter(b => b.status === 'pending').length,
      approvedBookings:  bookings.filter(b => b.status === 'approved').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      totalRevenue:      bookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0),
      averageRating:     4.5
    };

    res.json({ success: true, bookings, stats });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, vendor_response } = req.body;
    const { vendorId } = req.query;

    const check = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND vendor_id = $2',
      [bookingId, vendorId]
    );

    if (!check.rows.length) {
      return res.status(403).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    await pool.query(`
      UPDATE bookings 
      SET status = $1, vendor_response = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [status, vendor_response || null, bookingId]);

    res.json({ success: true, message: `Booking ${status} successfully` });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
};

// Get vendor profile
exports.getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.query;

    const result = await pool.query(
      'SELECT * FROM vendors WHERE id = $1',
      [vendorId]
    );

    res.json({ success: true, vendor: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};