const { pool } = require('../config/db');

// GET ALL APPROVED VENDORS (PUBLIC)
exports.getApprovedVendors = async (req, res) => {
  try {
    const [vendors] = await pool.query(
      `SELECT 
        v.id, 
        v.business_name, 
        v.owner_name, 
        v.email, 
        v.phone, 
        v.address, 
        v.city, 
        v.state, 
        v.zip_code, 
        v.service_category, 
        v.services_offered, 
        v.description, 
        v.years_in_business, 
        v.pricing, 
        v.availability, 
        v.website, 
        v.certification,
        v.created_at,
        COALESCE(AVG(r.rating), 0) as averageRating,
        COUNT(r.id) as reviewCount
       FROM vendors v
       LEFT JOIN reviews r ON v.id = r.vendor_id
       WHERE v.is_approved = true
       GROUP BY v.id
       ORDER BY v.created_at DESC`
    );

    res.json(vendors);

  } catch (error) {
    console.error('Error fetching approved vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR BY ID (PUBLIC)
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendors] = await pool.query(
      `SELECT 
        v.id, 
        v.business_name, 
        v.owner_name, 
        v.email, 
        v.phone, 
        v.address, 
        v.city, 
        v.state, 
        v.zip_code, 
        v.service_category, 
        v.services_offered, 
        v.description, 
        v.years_in_business, 
        v.pricing, 
        v.availability, 
        v.website, 
        v.certification,
        COALESCE(AVG(r.rating), 0) as averageRating,
        COUNT(r.id) as reviewCount
       FROM vendors v
       LEFT JOIN reviews r ON v.id = r.vendor_id
       WHERE v.id = ? AND v.is_approved = true
       GROUP BY v.id`,
      [id]
    );

    if (vendors.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendors[0]);

  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET VENDOR REVIEWS (PUBLIC)
exports.getVendorReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as customer_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(reviews);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// SEARCH VENDORS (PUBLIC)
exports.searchVendors = async (req, res) => {
  try {
    const { query, category, city, state } = req.query;

    let sql = `
      SELECT 
        v.id, 
        v.business_name, 
        v.service_category, 
        v.city, 
        v.state, 
        v.pricing,
        v.description,
        COALESCE(AVG(r.rating), 0) as averageRating,
        COUNT(r.id) as reviewCount
       FROM vendors v
       LEFT JOIN reviews r ON v.id = r.vendor_id
       WHERE v.is_approved = true
    `;

    const params = [];

    if (query) {
      sql += ' AND (v.business_name LIKE ? OR v.services_offered LIKE ? OR v.description LIKE ?)';
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ' AND v.service_category = ?';
      params.push(category);
    }

    if (city) {
      sql += ' AND v.city LIKE ?';
      params.push(`%${city}%`);
    }

    if (state) {
      sql += ' AND v.state = ?';
      params.push(state);
    }

    sql += ' GROUP BY v.id ORDER BY averageRating DESC, reviewCount DESC';

    const [vendors] = await pool.query(sql, params);

    res.json(vendors);

  } catch (error) {
    console.error('Error searching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};