const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};


const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// USER LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Admin check
    if (email === process.env.ADMIN_EMAIL) {
      const isValidAdmin = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
      if (!isValidAdmin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({
        userId: 'admin',
        email,
        role: 'admin',
        type: 'admin'
      });

      return res.json({
        success: true,
        token,
        user: {
          id: 'admin',
          name: 'Admin',
          email,
          role: 'admin'
        }
      });
    }

    // 🔹 Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 🔹 Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔹 Check if blocked
    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'user'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// USER REGISTRATION
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    await pool.query(
      "INSERT INTO users (id, name, email, password, phone, location) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, name, email, hashedPassword, phone, location],
    );

    const token = generateToken({ userId, email, role: "user", type: "user" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: userId, name, email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// VENDOR REGISTRATION
exports.registerVendor = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipCode,
      serviceCategory,
      servicesOffered,
      description,
      yearsInBusiness,
      pricing,
      availability,
      website,
      certification,
      additionalInfo,
    } = req.body;

    const existing = await pool.query(
      "SELECT * FROM vendors WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const vendorId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    let parsedAdditionalInfo = null;
    if (additionalInfo) {
      parsedAdditionalInfo =
        typeof additionalInfo === "string"
          ? additionalInfo
          : JSON.stringify(additionalInfo);
    }

    await pool.query(
      `INSERT INTO vendors 
       (id, business_name, owner_name, email, password, phone, address, city, state,
        zip_code, service_category, services_offered, description, years_in_business,
        pricing, availability, website, certification, additional_info, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,false)`,
      [
        vendorId,
        businessName,
        ownerName,
        email,
        hashedPassword,
        phone,
        address,
        city,
        state,
        zipCode,
        serviceCategory,
        servicesOffered,
        description,
        yearsInBusiness,
        pricing,
        availability,
        website,
        certification,
        parsedAdditionalInfo,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// VENDOR LOGIN
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM vendors WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const vendor = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!vendor.is_approved) {
      return res.status(403).json({
        message: "Your account is pending admin approval",
        isApproved: false,
      });
    }

    const token = generateToken({
      vendorId: vendor.id,
      email: vendor.email,
      type: "vendor",
    });

    res.json({
      success: true,
      token,
      isApproved: true,
      vendor: {
        id: vendor.id,
        businessName: vendor.business_name,
        email: vendor.email,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD - Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with this email address' 
      });
    }

    const user = result.rows[0];
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in database
    await pool.query(
      'UPDATE users SET reset_otp = $1, reset_otp_expiry = $2 WHERE email = $3',
      [otp, otpExpiry, email]
    );

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - HomeEase',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b91c1c;">Password Reset Request</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>You requested to reset your password. Use the following OTP to proceed:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 5px; font-weight: bold; border-radius: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">HomeEase Services - Secure Password Recovery</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent to your email address',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending OTP. Please try again.' 
    });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_otp = $2 AND reset_otp_expiry > NOW()',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP again
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_otp = $2 AND reset_otp_expiry > NOW()',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP fields
    await pool.query(
      'UPDATE users SET password = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};
