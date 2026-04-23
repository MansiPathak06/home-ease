// const { pool } = require('../config/db');

// // GET VENDOR PROFILE
// exports.getProfile = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const result = await pool.query(
//       `SELECT id, business_name, owner_name, email, phone, address, city, state,
//        zip_code, service_category, services_offered, description, years_in_business,
//        pricing, availability, website, certification, is_approved
//        FROM vendors WHERE id = $1`,
//       [vendorId]
//     );
//     if (result.rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching vendor profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // UPDATE VENDOR PROFILE
// exports.updateProfile = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const { businessName, ownerName, phone, address, city, state, zipCode, servicesOffered, description, pricing, availability, website, certification } = req.body;
//     await pool.query(
//       `UPDATE vendors SET business_name=$1, owner_name=$2, phone=$3, address=$4, city=$5, state=$6,
//        zip_code=$7, services_offered=$8, description=$9, pricing=$10, availability=$11,
//        website=$12, certification=$13 WHERE id=$14`,
//       [businessName, ownerName, phone, address, city, state, zipCode, servicesOffered, description, pricing, availability, website, certification, vendorId]
//     );
//     res.json({ success: true, message: 'Profile updated successfully' });
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET VENDOR BOOKINGS
// exports.getBookings = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const result = await pool.query(
//       `SELECT b.*,
//               u.name  AS customer_name,
//               u.email AS customer_email,
//               u.phone AS customer_phone
//        FROM bookings b
//        LEFT JOIN users u ON b.user_id = u.id
//        WHERE b.vendor_id = $1
//        ORDER BY b.created_at DESC`,
//       [vendorId]
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ── TIME SLOT CONFLICT CHECK ────────────────────────────────────────────────────
// // Logic: Vendor ek hi date pe same time slot ya uske 1 hour aage/peeche book nahi kar sakta
// const parseTimeToMinutes = (timeStr) => {
//   // Handles "09:00 AM", "2:00 PM", "14:00" formats
//   if (!timeStr) return null;
//   const clean = timeStr.trim().toUpperCase();
//   const ampm = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
//   if (ampm) {
//     let h = parseInt(ampm[1]);
//     const m = parseInt(ampm[2]);
//     if (ampm[3] === 'PM' && h !== 12) h += 12;
//     if (ampm[3] === 'AM' && h === 12) h = 0;
//     return h * 60 + m;
//   }
//   // 24hr format
//   const parts = clean.split(':');
//   if (parts.length >= 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
//   return null;
// };

// exports.checkTimeConflict = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const { date, time, excludeBookingId } = req.query;

//     if (!date || !time) {
//       return res.status(400).json({ conflict: false, message: 'Date and time required' });
//     }

//     // Get all approved/pending bookings for this vendor on this date
//     let query = `
//       SELECT id, date, time, status, customer_name
//       FROM bookings b
//       LEFT JOIN users u ON b.user_id = u.id
//       WHERE b.vendor_id = $1
//         AND b.date = $2
//         AND b.status IN ('pending', 'approved', 'rescheduled')
//     `;
//     const params = [vendorId, date];

//     if (excludeBookingId) {
//       query += ` AND b.id != $3`;
//       params.push(excludeBookingId);
//     }

//     const result = await pool.query(query, params);
//     const requestedMins = parseTimeToMinutes(time);

//     if (requestedMins === null) {
//       return res.status(400).json({ conflict: false, message: 'Invalid time format' });
//     }

//     const BUFFER_MINS = 60; // 1 hour buffer
//     let conflictingBooking = null;

//     for (const booking of result.rows) {
//       const existingMins = parseTimeToMinutes(booking.time);
//       if (existingMins === null) continue;
//       const diff = Math.abs(requestedMins - existingMins);
//       if (diff < BUFFER_MINS) {
//         conflictingBooking = booking;
//         break;
//       }
//     }

//     if (conflictingBooking) {
//       return res.json({
//         conflict: true,
//         message: `Already have a booking at ${conflictingBooking.time} on this date. Need at least 1 hour gap between bookings.`,
//         conflictingBooking: {
//           id: conflictingBooking.id,
//           time: conflictingBooking.time,
//           customerName: conflictingBooking.customer_name,
//         }
//       });
//     }

//     res.json({ conflict: false, message: 'Time slot is available' });

//   } catch (error) {
//     console.error('Error checking time conflict:', error);
//     res.status(500).json({ conflict: false, message: 'Server error' });
//   }
// };

// // UPDATE BOOKING STATUS — with conflict check on approve
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, vendor_response, new_date, new_time, service_notes, tracking_status } = req.body;
//     const vendorId = req.user.vendorId;

//     const check = await pool.query(
//       'SELECT * FROM bookings WHERE id = $1 AND vendor_id = $2',
//       [id, vendorId]
//     );
//     if (check.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
//     }

//     const current = check.rows[0];
//     const allowedTransitions = {
//       pending:     ['approved', 'rejected', 'rescheduled'],
//        pending_visit: ['approved', 'rejected', 'rescheduled'],
//       approved:    ['completed', 'rejected', 'rescheduled'],
//       rescheduled: ['approved', 'rejected'],
//       completed:   [],
//       rejected:    [],
//     };

//     if (status && !allowedTransitions[current.status]?.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot transition from "${current.status}" to "${status}"`
//       });
//     }

//     // ── CONFLICT CHECK on approve ──────────────────────────────────
//     if (status === 'approved') {
//       const bookingDate = new_date || current.date;
//       const bookingTime = new_time || current.time;
//       const requestedMins = parseTimeToMinutes(bookingTime);

//       if (requestedMins !== null) {
//         const conflictQuery = await pool.query(
//           `SELECT b.id, b.time, u.name AS customer_name
//            FROM bookings b
//            LEFT JOIN users u ON b.user_id = u.id
//            WHERE b.vendor_id = $1
//              AND b.date = $2
//              AND b.status IN ('approved', 'rescheduled')
//              AND b.id != $3`,
//           [vendorId, bookingDate, id]
//         );

//         for (const existing of conflictQuery.rows) {
//           const existingMins = parseTimeToMinutes(existing.time);
//           if (existingMins !== null && Math.abs(requestedMins - existingMins) < 60) {
//             return res.status(409).json({
//               success: false,
//               conflict: true,
//               message: `Time conflict! You already have a booking at ${existing.time}. Need at least 1 hour gap.`,
//               conflictingBooking: { id: existing.id, time: existing.time, customerName: existing.customer_name }
//             });
//           }
//         }
//       }
//     }

//     // Build dynamic SET clause
//     const fields = ['updated_at = CURRENT_TIMESTAMP'];
//     const values = [];
//     let idx = 1;

//     if (status !== undefined)           { fields.push(`status = $${idx++}`);            values.push(status); }
//     if (vendor_response !== undefined)  { fields.push(`vendor_response = $${idx++}`);   values.push(vendor_response || null); }
//     if (new_date !== undefined)         { fields.push(`new_date = $${idx++}`);          values.push(new_date); }
//     if (new_time !== undefined)         { fields.push(`new_time = $${idx++}`);          values.push(new_time); }
//     if (service_notes !== undefined)    { fields.push(`service_notes = $${idx++}`);     values.push(service_notes || null); }
//     if (tracking_status !== undefined)  { fields.push(`tracking_status = $${idx++}`);   values.push(tracking_status); }

//     values.push(id);
//     await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = $${idx}`, values);

//     res.json({ success: true, message: status ? `Booking ${status} successfully` : 'Booking updated' });

//   } catch (error) {
//     console.error('Error updating booking:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // GET VENDOR REVIEWS
// exports.getReviews = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const result = await pool.query(
//       `SELECT r.*, u.name AS customer_name
//        FROM reviews r LEFT JOIN users u ON r.user_id = u.id
//        WHERE r.vendor_id = $1 ORDER BY r.created_at DESC`,
//       [vendorId]
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching reviews:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET VENDOR SERVICES
// exports.getServices = async (req, res) => {
//   try {
//     res.json([]);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET VENDOR STATS — with weekly/monthly breakdown for charts
// exports.getStats = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;

//     const [total, pending, completed, revenue, rating, weekly, monthly] = await Promise.all([
//       pool.query('SELECT COUNT(*) AS count FROM bookings WHERE vendor_id = $1', [vendorId]),
//       pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id=$1 AND status IN ('pending','pending_visit')`, [vendorId]),
//       pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id=$1 AND status='completed'`, [vendorId]),
//       pool.query(`SELECT SUM(amount) AS total FROM bookings WHERE vendor_id=$1 AND status='completed'`, [vendorId]),
//       pool.query('SELECT AVG(rating) AS avg FROM reviews WHERE vendor_id = $1', [vendorId]),

//       // Last 7 days bookings count per day
//       pool.query(`
//         SELECT TO_CHAR(created_at, 'Dy') AS day,
//                TO_CHAR(created_at, 'MM-DD') AS date,
//                COUNT(*) AS bookings,
//                SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) AS revenue
//         FROM bookings
//         WHERE vendor_id=$1 AND created_at >= NOW() - INTERVAL '7 days'
//         GROUP BY TO_CHAR(created_at,'Dy'), TO_CHAR(created_at,'MM-DD')
//         ORDER BY date ASC
//       `, [vendorId]),

//       // Last 6 months
//       pool.query(`
//         SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
//                COUNT(*) AS bookings,
//                SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) AS revenue
//         FROM bookings
//         WHERE vendor_id=$1 AND created_at >= NOW() - INTERVAL '6 months'
//         GROUP BY DATE_TRUNC('month', created_at)
//         ORDER BY DATE_TRUNC('month', created_at) ASC
//       `, [vendorId]),
//     ]);

//     // Status distribution
//     const statusDist = await pool.query(`
//       SELECT status, COUNT(*) AS count
//       FROM bookings WHERE vendor_id=$1
//       GROUP BY status
//     `, [vendorId]);

//     res.json({
//       totalBookings:     parseInt(total.rows[0].count),
//       pendingBookings:   parseInt(pending.rows[0].count),
//       completedBookings: parseInt(completed.rows[0].count),
//       totalRevenue:      parseFloat(revenue.rows[0].total) || 0,
//       averageRating:     parseFloat(rating.rows[0].avg) || 0,
//       weeklyData:        weekly.rows,
//       monthlyData:       monthly.rows,
//       statusDistribution: statusDist.rows,
//     });

//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET SINGLE BOOKING
// exports.getSingleBooking = async (req, res) => {
//   try {
//     const vendorId = req.user.vendorId;
//     const { id } = req.params;
//     const result = await pool.query(
//       `SELECT b.*, u.name AS customer_name, u.email AS customer_email,
//               u.phone AS customer_phone
//        FROM bookings b LEFT JOIN users u ON b.user_id = u.id
//        WHERE b.id=$1 AND b.vendor_id=$2`,
//       [id, vendorId]
//     );
//     if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching single booking:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const { pool } = require('../config/db');

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const ampm = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (ampm) {
    let h = parseInt(ampm[1]); const m = parseInt(ampm[2]);
    if (ampm[3] === 'PM' && h !== 12) h += 12;
    if (ampm[3] === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const parts = clean.split(':');
  if (parts.length >= 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  return null;
};

exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const result = await pool.query(
      `SELECT id, business_name, owner_name, email, phone, address, city, state,
       zip_code, service_category, services_offered, description, years_in_business,
       pricing, availability, website, certification, is_approved FROM vendors WHERE id=$1`, [vendorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { businessName, ownerName, phone, address, city, state, zipCode, servicesOffered, description, pricing, availability, website, certification } = req.body;
    await pool.query(
      `UPDATE vendors SET business_name=$1,owner_name=$2,phone=$3,address=$4,city=$5,state=$6,
       zip_code=$7,services_offered=$8,description=$9,pricing=$10,availability=$11,website=$12,certification=$13 WHERE id=$14`,
      [businessName, ownerName, phone, address, city, state, zipCode, servicesOffered, description, pricing, availability, website, certification, vendorId]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getBookings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const result = await pool.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM bookings b LEFT JOIN users u ON b.user_id=u.id
       WHERE b.vendor_id=$1 ORDER BY b.created_at DESC`, [vendorId]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getSingleBooking = async (req, res) => {
  try {
    const vendorId = req.user.vendorId; const { id } = req.params;
    const result = await pool.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM bookings b LEFT JOIN users u ON b.user_id=u.id WHERE b.id=$1 AND b.vendor_id=$2`, [id, vendorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.checkTimeConflict = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { date, time, excludeBookingId } = req.query;
    if (!date || !time) return res.status(400).json({ conflict: false, message: 'Date and time required' });
    let q = `SELECT b.id,b.time,u.name AS customer_name FROM bookings b LEFT JOIN users u ON b.user_id=u.id
             WHERE b.vendor_id=$1 AND b.date=$2 AND b.status IN ('pending','pending_visit','approved','rescheduled')`;
    const params = [vendorId, date];
    if (excludeBookingId) { q += ` AND b.id!=$3`; params.push(excludeBookingId); }
    const result = await pool.query(q, params);
    const reqMins = parseTimeToMinutes(time);
    if (reqMins === null) return res.status(400).json({ conflict: false, message: 'Invalid time' });
    for (const b of result.rows) {
      const em = parseTimeToMinutes(b.time);
      if (em !== null && Math.abs(reqMins - em) < 60)
        return res.json({ conflict: true, message: `Conflict with booking at ${b.time}. Need 1hr gap.`, conflictingBooking: { id: b.id, time: b.time, customerName: b.customer_name } });
    }
    res.json({ conflict: false, message: 'Slot available' });
  } catch (err) { console.error(err); res.status(500).json({ conflict: false, message: 'Server error' }); }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vendor_response, new_date, new_time, service_notes, tracking_status } = req.body;
    const vendorId = req.user.vendorId;
    const check = await pool.query('SELECT * FROM bookings WHERE id=$1 AND vendor_id=$2', [id, vendorId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const current = check.rows[0];
    const allowed = {
      pending: ['approved','rejected','rescheduled'],
      pending_visit: ['approved','rejected','rescheduled'],
      approved: ['completed','rejected','rescheduled'],
      rescheduled: ['approved','rejected'],
      completed: [], rejected: [],
    };
    if (status && !allowed[current.status]?.includes(status))
      return res.status(400).json({ success: false, message: `Cannot go from "${current.status}" to "${status}"` });

    if (status === 'approved') {
      const bDate = new_date || current.date; const bTime = new_time || current.time;
      const reqMins = parseTimeToMinutes(bTime);
      if (reqMins !== null) {
        const cq = await pool.query(
          `SELECT b.id,b.time,u.name AS customer_name FROM bookings b LEFT JOIN users u ON b.user_id=u.id
           WHERE b.vendor_id=$1 AND b.date=$2 AND b.status IN ('approved','rescheduled') AND b.id!=$3`,
          [vendorId, bDate, id]
        );
        for (const ex of cq.rows) {
          const em = parseTimeToMinutes(ex.time);
          if (em !== null && Math.abs(reqMins - em) < 60)
            return res.status(409).json({ success: false, conflict: true, message: `Conflict at ${ex.time}. Need 1hr gap.` });
        }
      }
    }

    const fields = ['updated_at=CURRENT_TIMESTAMP']; const values = []; let idx = 1;
    if (status !== undefined)           { fields.push(`status=$${idx++}`);           values.push(status); }
    if (vendor_response !== undefined)  { fields.push(`vendor_response=$${idx++}`);  values.push(vendor_response || null); }
    if (new_date !== undefined)         { fields.push(`new_date=$${idx++}`);         values.push(new_date); }
    if (new_time !== undefined)         { fields.push(`new_time=$${idx++}`);         values.push(new_time); }
    if (service_notes !== undefined)    { fields.push(`service_notes=$${idx++}`);    values.push(service_notes || null); }
    if (tracking_status !== undefined)  { fields.push(`tracking_status=$${idx++}`);  values.push(tracking_status); }
    values.push(id);
    await pool.query(`UPDATE bookings SET ${fields.join(',')} WHERE id=$${idx}`, values);
    res.json({ success: true, message: status ? `Booking ${status}` : 'Updated' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

// ── SEND PRICE QUOTE ───────────────────────────────────────────────────────
// Vendor reaches customer's house, assesses work, sends quote
exports.sendPriceQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quote_amount, quote_note } = req.body;
    const vendorId = req.user.vendorId;
    if (!quote_amount || isNaN(quote_amount) || Number(quote_amount) <= 0)
      return res.status(400).json({ success: false, message: 'Valid quote amount required' });
    const check = await pool.query('SELECT * FROM bookings WHERE id=$1 AND vendor_id=$2', [id, vendorId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (check.rows[0].status !== 'approved')
      return res.status(400).json({ success: false, message: 'Can only quote approved bookings' });
    await pool.query(
      `UPDATE bookings SET quote_amount=$1, quote_status='pending_user',
       quote_sent_at=CURRENT_TIMESTAMP, vendor_response=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
      [Number(quote_amount), quote_note || null, id]
    );
    res.json({ success: true, message: 'Quote sent to customer' });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

// ── RECORD FINAL PAYMENT ───────────────────────────────────────────────────
// After service, vendor updates how customer paid
exports.updateFinalPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_payment_method } = req.body;
    const vendorId = req.user.vendorId;
    if (!['cash', 'online'].includes(final_payment_method))
      return res.status(400).json({ success: false, message: 'Must be cash or online' });
    const check = await pool.query('SELECT * FROM bookings WHERE id=$1 AND vendor_id=$2', [id, vendorId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const bk = check.rows[0];
    if (bk.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Only for completed bookings' });
    const totalAmount   = Number(bk.final_amount || bk.quote_amount || bk.amount || 0);
    const commissionPct = Number(bk.commission_pct || 10);
    const adminEarning  = Math.round((totalAmount * commissionPct) / 100);
    const vendorPayout  = totalAmount - adminEarning;
    await pool.query(
      `UPDATE bookings SET final_payment_method=$1, final_payment_status='paid',
       final_paid_at=CURRENT_TIMESTAMP, final_amount=$2, admin_earning=$3,
       vendor_payout=$4, payout_status='pending', updated_at=CURRENT_TIMESTAMP WHERE id=$5`,
      [final_payment_method, totalAmount, adminEarning, vendorPayout, id]
    );
    res.json({ success: true, message: 'Payment recorded', summary: { totalAmount, commissionPct, adminEarning, vendorPayout } });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getReviews = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const result = await pool.query(
      `SELECT r.*, u.name AS customer_name FROM reviews r LEFT JOIN users u ON r.user_id=u.id
       WHERE r.vendor_id=$1 ORDER BY r.created_at DESC`, [vendorId]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getServices = async (req, res) => { try { res.json([]); } catch { res.status(500).json({ message: 'Server error' }); } };

exports.getStats = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const [total, pending, completed, revenue, rating, weekly, monthly, statusDist] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM bookings WHERE vendor_id=$1', [vendorId]),
      pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id=$1 AND status IN ('pending','pending_visit')`, [vendorId]),
      pool.query(`SELECT COUNT(*) AS count FROM bookings WHERE vendor_id=$1 AND status='completed'`, [vendorId]),
      pool.query(`SELECT COALESCE(SUM(vendor_payout),0) AS total FROM bookings WHERE vendor_id=$1 AND status='completed'`, [vendorId]),
      pool.query('SELECT AVG(rating) AS avg FROM reviews WHERE vendor_id=$1', [vendorId]),
      pool.query(`SELECT TO_CHAR(created_at,'Dy') AS day,TO_CHAR(created_at,'MM-DD') AS date,COUNT(*) AS bookings,
                 COALESCE(SUM(CASE WHEN status='completed' THEN vendor_payout ELSE 0 END),0) AS revenue
                 FROM bookings WHERE vendor_id=$1 AND created_at>=NOW()-INTERVAL '7 days'
                 GROUP BY TO_CHAR(created_at,'Dy'),TO_CHAR(created_at,'MM-DD') ORDER BY date ASC`, [vendorId]),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month',created_at),'Mon') AS month,COUNT(*) AS bookings,
                 COALESCE(SUM(CASE WHEN status='completed' THEN vendor_payout ELSE 0 END),0) AS revenue
                 FROM bookings WHERE vendor_id=$1 AND created_at>=NOW()-INTERVAL '6 months'
                 GROUP BY DATE_TRUNC('month',created_at) ORDER BY DATE_TRUNC('month',created_at) ASC`, [vendorId]),
      pool.query(`SELECT status,COUNT(*) AS count FROM bookings WHERE vendor_id=$1 GROUP BY status`, [vendorId]),
    ]);
    res.json({
      totalBookings: parseInt(total.rows[0].count), pendingBookings: parseInt(pending.rows[0].count),
      completedBookings: parseInt(completed.rows[0].count), totalRevenue: parseFloat(revenue.rows[0].total) || 0,
      averageRating: parseFloat(rating.rows[0].avg) || 0,
      weeklyData: weekly.rows, monthlyData: monthly.rows, statusDistribution: statusDist.rows,
    });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};