// const { pool } = require('../config/db');

// // GET USER PROFILE
// exports.getProfile = async (req, res) => {
//   try {
//        console.log("=== getProfile called ===");
//     console.log("req.user:", req.user);
//     const userId = req.user.userId;
//     console.log("userId:", userId);

//     const result = await pool.query(
//       'SELECT id, name, email, phone, location, created_at FROM users WHERE id = $1',
//       [userId]
//     );
//       console.log("DB result:", result.rows);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(result.rows[0]);

//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // UPDATE USER PROFILE
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { name, email, phone, location } = req.body;

//     await pool.query(
//       'UPDATE users SET name = $1, email = $2, phone = $3, location = $4 WHERE id = $5',
//       [name, email, phone, location, userId]
//     );

//     res.json({ success: true, message: 'Profile updated successfully' });

//   } catch (error) {
//     if (error.code === '23505') {
//       return res.status(400).json({ success: false, message: 'Email already in use' });
//     }
//     console.error('Error updating profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET USER BOOKINGS
// exports.getBookings = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const result = await pool.query(
//       `SELECT 
//          b.*,
//          COALESCE(b.vendor_name, v.business_name) AS vendor_name,
//          COALESCE(b.service_name, v.service_category) AS service_name,
//          v.phone AS vendor_phone
//        FROM bookings b
//        LEFT JOIN vendors v ON b.vendor_id = v.id
//        WHERE b.user_id = $1
//        ORDER BY b.created_at DESC`,
//       [userId]
//     );

//     console.log("BOOKINGS RETURNED:", JSON.stringify(result.rows, null, 2));
//     res.json(result.rows);

//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // CREATE BOOKING
// exports.createBooking = async (req, res) => {
//   try {
//     const userId = req.user.userId;  // ← yeh bhi fix kiya (pehle req.user.id tha)
//     const {
//       vendor_id, service_name, vendor_name,
//       date, time, message, amount,
//       payment_method = 'cod',
//     } = req.body;

//     const ADVANCE_AMOUNT = parseInt(process.env.ADVANCE_AMOUNT || '99');

//     // ID generate karo — same pattern jo baaki controllers use karte hain
//     const bookingId = Date.now().toString(36) + Math.random().toString(36).substr(2);

//     const result = await pool.query(
//       `INSERT INTO bookings
//         (id, user_id, vendor_id, service_name, vendor_name, date, time, message,
//          amount, status, payment_method, payment_status, advance_amount)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
//        RETURNING id`,
//       [
//         bookingId,      // ← yeh add kiya
//         userId,
//         vendor_id,
//         service_name,
//         vendor_name,
//         date,
//         time,
//         message || '',
//         amount || 0,
//         'pending_visit',
//         'cod',
//         'pending',
//         ADVANCE_AMOUNT,
//       ]
//     );

//     res.json({ success: true, bookingId: result.rows[0].id });
//   } catch (error) {
//     console.error('Create booking error:', error);
//     res.status(500).json({ success: false, message: 'Booking failed' });
//   }
// };

// // CANCEL BOOKING
// exports.cancelBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.userId;
//     const { reason } = req.body;

//     const check = await pool.query(
//       'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
//       [id, userId]
//     );

//     if (check.rows.length === 0) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     await pool.query(
//       'UPDATE bookings SET status = $1, cancellation_reason = $2 WHERE id = $3',
//       ['cancelled', reason || '', id]
//     );

//     res.json({ success: true, message: 'Booking cancelled' });

//   } catch (error) {
//     console.error('Error cancelling booking:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET FAVORITES
// exports.getFavorites = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const result = await pool.query(
//       `SELECT f.*, v.business_name, v.service_category, v.city, v.state
//        FROM favorites f
//        LEFT JOIN vendors v ON f.vendor_id = v.id
//        WHERE f.user_id = $1`,
//       [userId]
//     );

//     res.json(result.rows);

//   } catch (error) {
//     console.error('Error fetching favorites:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ADD FAVORITE
// exports.addFavorite = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { vendorId } = req.body;

//     const existing = await pool.query(
//       'SELECT * FROM favorites WHERE user_id = $1 AND vendor_id = $2',
//       [userId, vendorId]
//     );

//     if (existing.rows.length > 0) {
//       return res.status(400).json({ message: 'Already in favorites' });
//     }

//     const favoriteId = Date.now().toString(36) + Math.random().toString(36).substr(2);

//     await pool.query(
//       'INSERT INTO favorites (id, user_id, vendor_id) VALUES ($1, $2, $3)',
//       [favoriteId, userId, vendorId]
//     );

//     res.status(201).json({ success: true, message: 'Added to favorites' });

//   } catch (error) {
//     console.error('Error adding favorite:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // REMOVE FAVORITE
// exports.removeFavorite = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { vendorId } = req.params;

//     await pool.query(
//       'DELETE FROM favorites WHERE user_id = $1 AND vendor_id = $2',
//       [userId, vendorId]
//     );

//     res.json({ success: true, message: 'Removed from favorites' });

//   } catch (error) {
//     console.error('Error removing favorite:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ADD REVIEW
// exports.addReview = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { vendorId, rating, comment } = req.body;

//     const bookings = await pool.query(
//       `SELECT * FROM bookings WHERE user_id = $1 AND vendor_id = $2 AND status = 'completed'`,
//       [userId, vendorId]
//     );

//     if (bookings.rows.length === 0) {
//       return res.status(400).json({ message: 'You can only review vendors you have booked' });
//     }

//     const userResult = await pool.query(
//       'SELECT name FROM users WHERE id = $1',
//       [userId]
//     );

//     const reviewId = Date.now().toString(36) + Math.random().toString(36).substr(2);
//     const currentDate = new Date().toISOString().split('T')[0];

//     await pool.query(
//       `INSERT INTO reviews (id, vendor_id, user_id, customer_name, rating, comment, date) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//       [reviewId, vendorId, userId, userResult.rows[0].name, rating, comment, currentDate]
//     );

//     res.status(201).json({ success: true, message: 'Review added successfully' });

//   } catch (error) {
//     console.error('Error adding review:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const { pool } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT id, name, email, phone, location, created_at FROM users WHERE id=$1', [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, location } = req.body;
    await pool.query('UPDATE users SET name=$1,email=$2,phone=$3,location=$4 WHERE id=$5', [name, email, phone, location, userId]);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Email already in use' });
    console.error(err); res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT b.*,
         COALESCE(b.vendor_name, v.business_name) AS vendor_name,
         COALESCE(b.service_name, v.service_category) AS service_name,
         v.phone AS vendor_phone
       FROM bookings b LEFT JOIN vendors v ON b.vendor_id=v.id
       WHERE b.user_id=$1 ORDER BY b.created_at DESC`, [userId]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendor_id, service_name, vendor_name, date, time, message, amount, payment_method = 'cod' } = req.body;
    const ADVANCE = parseInt(process.env.ADVANCE_AMOUNT || '99');
    const bookingId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const result = await pool.query(
      `INSERT INTO bookings (id,user_id,vendor_id,service_name,vendor_name,date,time,message,amount,status,payment_method,payment_status,advance_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending_visit','cod','pending',$10) RETURNING id`,
      [bookingId, userId, vendor_id, service_name, vendor_name, date, time, message || '', amount || 0, ADVANCE]
    );
    res.json({ success: true, bookingId: result.rows[0].id });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Booking failed' }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; const userId = req.user.userId;
    const { reason } = req.body;
    const check = await pool.query('SELECT * FROM bookings WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    await pool.query('UPDATE bookings SET status=$1,cancellation_reason=$2 WHERE id=$3', ['cancelled', reason || '', id]);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

// ── RESPOND TO PRICE QUOTE ─────────────────────────────────────────────────
// User accepts or rejects the price quote sent by vendor
exports.respondToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' | 'reject'
    const userId = req.user.userId;

    if (!['accept', 'reject'].includes(action))
      return res.status(400).json({ success: false, message: 'Action must be accept or reject' });

    const check = await pool.query('SELECT * FROM bookings WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });

    const booking = check.rows[0];
    if (booking.quote_status !== 'pending_user')
      return res.status(400).json({ success: false, message: 'No pending quote for this booking' });

    if (action === 'accept') {
      // Accept: set final_amount = quote_amount, update quote_status
      await pool.query(
        `UPDATE bookings SET quote_status='accepted', final_amount=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
        [booking.quote_amount, id]
      );
      res.json({ success: true, message: 'Quote accepted! Service will proceed.', amount: booking.quote_amount });
    } else {
      // Reject: service cancelled, vendor is informed
      await pool.query(
        `UPDATE bookings SET quote_status='rejected', status='cancelled',
         cancellation_reason='Customer rejected the price quote', updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
        [id]
      );
      res.json({ success: true, message: 'Quote rejected. Booking cancelled.' });
    }
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT f.*, v.business_name, v.service_category, v.city, v.state
       FROM favorites f LEFT JOIN vendors v ON f.vendor_id=v.id WHERE f.user_id=$1`, [userId]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId; const { vendorId } = req.body;
    const existing = await pool.query('SELECT * FROM favorites WHERE user_id=$1 AND vendor_id=$2', [userId, vendorId]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Already in favorites' });
    const favId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    await pool.query('INSERT INTO favorites (id,user_id,vendor_id) VALUES ($1,$2,$3)', [favId, userId, vendorId]);
    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId; const { vendorId } = req.params;
    await pool.query('DELETE FROM favorites WHERE user_id=$1 AND vendor_id=$2', [userId, vendorId]);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.addReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendorId, rating, comment } = req.body;
    const bookings = await pool.query(
      `SELECT * FROM bookings WHERE user_id=$1 AND vendor_id=$2 AND status='completed'`, [userId, vendorId]
    );
    if (bookings.rows.length === 0)
      return res.status(400).json({ message: 'You can only review vendors you have used' });
    const userResult = await pool.query('SELECT name FROM users WHERE id=$1', [userId]);
    const reviewId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const currentDate = new Date().toISOString().split('T')[0];
    await pool.query(
      `INSERT INTO reviews (id,vendor_id,user_id,customer_name,rating,comment,date) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [reviewId, vendorId, userId, userResult.rows[0].name, rating, comment, currentDate]
    );
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};