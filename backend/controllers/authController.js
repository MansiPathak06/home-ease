const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// ─── IN authController.js, inside loginUser ──────────────────────────────────
// After you verify the password is valid, ADD this check before generating token:


// Then continue with token generation as normal...

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// USER LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin
    if (email === process.env.ADMIN_EMAIL && password === '@Mansi123') {
      const token = generateToken({
        email: email,
        type: 'admin'
      });

      return res.json({
        success: true,
        token,
        user: {
          email: email,
          type: 'admin'
        }
      });
    }

    // Find user in database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
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

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'user'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
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

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Insert user
    await pool.query(
      'INSERT INTO users (id, name, email, password, phone, location) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, phone, location]
    );

    // Generate token
    const token = generateToken({
      userId: userId,
      email: email,
      type: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name,
        email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VENDOR REGISTRATION
// VENDOR REGISTRATION — replace your existing registerVendor with this
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
      additionalInfo   // ← new field from frontend
    } = req.body;

    // Check if vendor exists
    const [existingVendors] = await pool.query(
      'SELECT * FROM vendors WHERE email = ?',
      [email]
    );

    if (existingVendors.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const vendorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Parse additionalInfo safely
    let parsedAdditionalInfo = null;
    if (additionalInfo) {
      try {
        // If it's already an object (sent as JSON body), stringify it for storage
        // If it's a string, validate it's proper JSON
        parsedAdditionalInfo = typeof additionalInfo === 'string'
          ? additionalInfo
          : JSON.stringify(additionalInfo);
      } catch (e) {
        parsedAdditionalInfo = null;
      }
    }

    // Insert vendor
    await pool.query(
      `INSERT INTO vendors 
       (id, business_name, owner_name, email, password, phone, address, city, state, 
        zip_code, service_category, services_offered, description, years_in_business, 
        pricing, availability, website, certification, additional_info, is_approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false)`,
      [
        vendorId, businessName, ownerName, email, hashedPassword, phone, address,
        city, state, zipCode, serviceCategory, servicesOffered, description,
        yearsInBusiness, pricing, availability, website, certification,
        parsedAdditionalInfo   // ← added here
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

    // Find vendor
    const [vendors] = await pool.query(
      'SELECT * FROM vendors WHERE email = ?',
      [email]
    );

    if (vendors.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const vendor = vendors[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if approved
    if (!vendor.is_approved) {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval',
        isApproved: false
      });
    }

    // Generate token
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