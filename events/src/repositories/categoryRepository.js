const pool = require('../config/db');

async function listCategories() {
  const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');
  return rows;
}

async function createCategory(name) {
  const [result] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [name]);
  const [rows] = await pool.execute('SELECT id, name FROM categories WHERE id = ?', [result.insertId]);
  return rows[0];
}

module.exports = {
  listCategories,
  createCategory
};
