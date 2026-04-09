const { pool } = require('../config/db');

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sc.*,
        COUNT(v.id) AS vendor_count
      FROM service_categories sc
      LEFT JOIN vendors v ON v.service_category = sc.name
      GROUP BY sc.id
      ORDER BY sc.name ASC
    `);
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, base_price, commission_pct, is_active } = req.body;

    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Category name is required' });

    await pool.query(
      `INSERT INTO service_categories (name, description, icon, base_price, commission_pct, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        name.trim(),
        description ?? null,
        icon ?? '📦',
        base_price ?? null,
        commission_pct ?? 15,
        is_active ? 1 : 0
      ]
    );
    res.json({ success: true, message: 'Category created successfully' });

  } catch (err) {
    // PostgreSQL duplicate key error code is '23505' (not 'ER_DUP_ENTRY')
    if (err.code === '23505')
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    console.error('createCategory error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, base_price, commission_pct, is_active } = req.body;

    await pool.query(
      `UPDATE service_categories
       SET name=$1, description=$2, icon=$3, base_price=$4, commission_pct=$5, is_active=$6
       WHERE id=$7`,
      [name, description ?? null, icon ?? '📦', base_price ?? null, commission_pct ?? 15, is_active ? 1 : 0, id]
    );
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM service_categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};