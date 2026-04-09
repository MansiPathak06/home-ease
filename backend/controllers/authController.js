const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// USER LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin
    if (email === process.env.ADMIN_EMAIL && password === '@Mansi123') {
      const token = generateToken({ email, type: 'admin' });
      return res.json({
        success: true,
        token,
        user: { email, type: 'admin' }
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'user'
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
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

    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    await pool.query(
      'INSERT INTO users (id, name, email, password, phone, location) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, name, email, hashedPassword, phone, location]
    );

    const token = generateToken({ userId, email, type: 'user' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: userId, name, email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VENDOR REGISTRATION
exports.registerVendor = async (req, res) => {
  try {
    const {
      businessName, ownerName, email, password, phone,
      address, city, state, zipCode, serviceCategory,
      servicesOffered, description, yearsInBusiness,
      pricing, availability, website, certification, additionalInfo
    } = req.body;

    const existing = await pool.query(
      'SELECT * FROM vendors WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const vendorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    let parsedAdditionalInfo = null;
    if (additionalInfo) {
      parsedAdditionalInfo = typeof additionalInfo === 'string'
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
        vendorId, businessName, ownerName, email, hashedPassword, phone,
        address, city, state, zipCode, serviceCategory, servicesOffered,
        description, yearsInBusiness, pricing, availability,
        website, certification, parsedAdditionalInfo
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.'
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VENDOR LOGIN
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM vendors WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const vendor = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!vendor.is_approved) {
      return res.status(403).json({
        message: 'Your account is pending admin approval',
        isApproved: false
      });
    }

    const token = generateToken({
      vendorId: vendor.id,
      email: vendor.email,
      type: 'vendor'
    });

    res.json({
      success: true,
      token,
      isApproved: true,
      vendor: {
        id: vendor.id,
        businessName: vendor.business_name,
        email: vendor.email
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};