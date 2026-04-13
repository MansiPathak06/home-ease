const { pool } = require("../config/db");

// GET ALL APPROVED VENDORS
exports.getApprovedVendors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        v.id, v.business_name, v.owner_name, v.email, v.phone,
        v.address, v.city, v.state, v.zip_code, v.service_category,
        v.services_offered, v.description, v.years_in_business,
        v.pricing, v.availability, v.website, v.certification, v.created_at,
        COALESCE(AVG(r.rating), 0) AS "averageRating",
        COUNT(r.id)                AS "reviewCount"
       FROM vendors v
       LEFT JOIN reviews r ON v.id = r.vendor_id
       WHERE v.is_approved = true
       GROUP BY v.id
       ORDER BY v.created_at DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching approved vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET VENDOR BY ID
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        v.id, v.business_name, v.owner_name, v.email, v.phone,
        v.address, v.city, v.state, v.zip_code, v.service_category,
        v.services_offered, v.description, v.years_in_business,
        v.pricing, v.availability, v.website, v.certification,
        COALESCE(AVG(r.rating), 0) AS "averageRating",
        COUNT(r.id)                AS "reviewCount"
       FROM vendors v
       LEFT JOIN reviews r ON v.id = r.vendor_id
       WHERE v.id = $1 AND v.is_approved = true
       GROUP BY v.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET VENDOR REVIEWS
exports.getVendorReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name AS customer_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SEARCH VENDORS
exports.searchVendors = async (req, res) => {
  try {
    const { query, category, city, state } = req.query;

    // Build query dynamically with correct $N indexes
    let sql = `
      SELECT
        v.id, v.business_name, v.service_category,
        v.city, v.state, v.pricing, v.description,
        COALESCE(AVG(r.rating), 0) AS "averageRating",
        COUNT(r.id)                AS "reviewCount"
      FROM vendors v
      LEFT JOIN reviews r ON v.id = r.vendor_id
      WHERE v.is_approved = true
    `;

    const params = [];
    let idx = 1;
    if (query) {
      sql += ` AND (
    v.business_name ILIKE $${idx} OR
    v.services_offered ILIKE $${idx + 1} OR
    v.description ILIKE $${idx + 2} OR
    v.service_category ILIKE $${idx + 3}
  )`;
      const term = `%${query}%`;
      params.push(term, term, term, term);
      idx += 4;
    }

    if (category) {
      sql += ` AND v.service_category = $${idx++}`;
      params.push(category);
    }

    if (city) {
      sql += ` AND v.city ILIKE $${idx++}`;
      params.push(`%${city}%`);
    }

    if (state) {
      sql += ` AND v.state = $${idx++}`;
      params.push(state);
    }

    sql += ` GROUP BY v.id ORDER BY "averageRating" DESC, "reviewCount" DESC`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error searching vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
};
