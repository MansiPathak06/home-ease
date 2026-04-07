const { pool } = require('../config/db');

// GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, location, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, location } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, location = ? WHERE id = ?',
      [name, phone, location, userId]
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

// GET USER BOOKINGS
exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [bookings] = await pool.query(
      `SELECT 
         b.*,
         COALESCE(b.vendor_name, v.business_name) as vendor_name,
         COALESCE(b.service_name, v.service_category) as service_name,
         v.phone as vendor_phone
       FROM bookings b
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    // 👇 ADD THIS
    console.log("BOOKINGS RETURNED:", JSON.stringify(bookings, null, 2));

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    // ✅ Match exactly what frontend sends
    const { vendor_id, service_name, vendor_name, date, time, guests, message, amount } = req.body;

      // ✅ Guard against null vendor_id
    if (!vendor_id) {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }

    const [users] = await pool.query(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    const bookingId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    await pool.query(
      `INSERT INTO bookings 
       (id, user_id, vendor_id, service_name, vendor_name, customer_name, date, time, guests, message, amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [bookingId, userId, vendor_id, service_name, vendor_name,
       users[0].name, date, time, guests || 0, message || '', amount || 0]
    );

    res.status(201).json({ success: true, message: 'Booking created successfully', bookingId });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CANCEL BOOKING
// exports.cancelBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.userId;
//     const { reason } = req.body;

//     // Verify booking belongs to user
//     const [bookings] = await pool.query(
//       'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
//       [id, userId]
//     );

//     if (bookings.length === 0) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // Update status to cancelled
//     await pool.query(
//       'UPDATE bookings SET status = "cancelled" WHERE id = ?',
//       [id]
//     );

//     res.json({
//       success: true,
//       message: 'Booking cancelled'
//     });

//   } catch (error) {
//     console.error('Error cancelling booking:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body; // ✅ capture reason from frontend

    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await pool.query(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ? WHERE id = ?',
      [reason || '', id]
    );

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET USER FAVORITES
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [favorites] = await pool.query(
      `SELECT f.*, v.business_name, v.service_category, v.city, v.state
       FROM favorites f
       LEFT JOIN vendors v ON f.vendor_id = v.id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.json(favorites);

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD FAVORITE
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendorId } = req.body;

    // Check if already favorited
    const [existing] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? AND vendor_id = ?',
      [userId, vendorId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    // Generate favorite ID
    const favoriteId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Add to favorites
    await pool.query(
      'INSERT INTO favorites (id, user_id, vendor_id) VALUES (?, ?, ?)',
      [favoriteId, userId, vendorId]
    );

    res.status(201).json({
      success: true,
      message: 'Added to favorites'
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// REMOVE FAVORITE
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendorId } = req.params;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND vendor_id = ?',
      [userId, vendorId]
    );

    res.json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendorId, rating, comment } = req.body;

    // Check if user has booking with vendor
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE user_id = ? AND vendor_id = ? AND status = "completed"',
      [userId, vendorId]
    );

    if (bookings.length === 0) {
      return res.status(400).json({ 
        message: 'You can only review vendors you have booked' 
      });
    }

    // Get user details
    const [users] = await pool.query(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    // Generate review ID
    const reviewId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const currentDate = new Date().toISOString().split('T')[0];

    // Add review
    await pool.query(
      `INSERT INTO reviews 
       (id, vendor_id, user_id, customer_name, rating, comment, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reviewId, vendorId, userId, users[0].name, rating, comment, currentDate]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};