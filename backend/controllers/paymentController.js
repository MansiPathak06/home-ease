const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ADVANCE_AMOUNT = parseInt(process.env.ADVANCE_AMOUNT || '99');

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: ADVANCE_AMOUNT * 100, // paise mein
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData, // { vendor_id, service_name, vendor_name, date, time, message }
    } = req.body;

    // Signature verify karo
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Booking save karo
    const userId = req.user.id;
    const result = await pool.query(
      `INSERT INTO bookings 
        (user_id, vendor_id, service_name, vendor_name, date, time, message,
         amount, status, payment_method, payment_status,
         advance_amount, razorpay_order_id, razorpay_payment_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        userId,
        bookingData.vendor_id,
        bookingData.service_name,
        bookingData.vendor_name,
        bookingData.date,
        bookingData.time,
        bookingData.message || '',
        0,
        'confirmed',
        'razorpay',
        'paid',
        ADVANCE_AMOUNT,
        razorpay_order_id,
        razorpay_payment_id,
      ]
    );

    res.json({ success: true, bookingId: result.rows[0].id });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Booking creation failed' });
  }
};