const db = require('../config/db');

// Get vendor's bookings + stats (SIMPLEST VERSION)
exports.getVendorBookings = async (req, res) => {
  try {
    const { vendorId } = req.query; // Get vendorId from frontend localStorage
    
    const [bookings] = await db.execute(`
      SELECT b.*, 
             v.business_name as vendor_name
      FROM bookings b 
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.vendor_id = ?
      ORDER BY b.created_at DESC
    `, [vendorId]);

    // Calculate stats
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      approvedBookings: bookings.filter(b => b.status === 'approved').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0),
      averageRating: 4.5 // Static for now
    };

    res.json({
      success: true,
      bookings,
      stats
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, vendor_response } = req.body;
    const { vendorId } = req.query;

    // Verify booking belongs to vendor
    const [booking] = await db.execute(
      'SELECT * FROM bookings WHERE id = ? AND vendor_id = ?', 
      [bookingId, vendorId]
    );

    if (!booking.length) {
      return res.status(403).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    await db.execute(`
      UPDATE bookings 
      SET status = ?, 
          vendor_response = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, vendor_response || null, bookingId]);

    res.json({
      success: true,
      message: `Booking ${status} successfully`
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
};

// Get vendor profile
exports.getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.query;
    const [vendor] = await db.execute(
      'SELECT * FROM vendors WHERE id = ?', 
      [vendorId]
    );
    
    res.json({
      success: true,
      vendor: vendor[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
