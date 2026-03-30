const pool = require('../config/db');

async function createUser({ name, email, passwordHash, latitude, longitude, preferredLanguage }) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash, latitude, longitude, preferred_language)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, latitude ?? null, longitude ?? null, preferredLanguage || 'en']
  );

  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, latitude, longitude, preferred_language, created_at, updated_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function updateProfile(id, { latitude, longitude, preferredLanguage }) {
  await pool.execute(
    `UPDATE users
     SET latitude = COALESCE(?, latitude),
         longitude = COALESCE(?, longitude),
         preferred_language = COALESCE(?, preferred_language)
     WHERE id = ?`,
    [latitude ?? null, longitude ?? null, preferredLanguage ?? null, id]
  );
  return findById(id);
}

async function replacePreferences(userId, categoryIds) {
  await pool.execute('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return;
  }

  const values = categoryIds.map((categoryId) => [userId, categoryId]);
  const placeholders = values.map(() => '(?, ?)').join(', ');
  const flat = values.flat();

  await pool.execute(
    `INSERT INTO user_preferences (user_id, category_id) VALUES ${placeholders}`,
    flat
  );
}

async function getPreferenceCategoryIds(userId) {
  const [rows] = await pool.execute(
    'SELECT category_id FROM user_preferences WHERE user_id = ?',
    [userId]
  );
  return rows.map((row) => row.category_id);
}

async function listUsersByPreferredCategories(categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return [];
  }

  const placeholders = categoryIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT DISTINCT u.id, u.name, u.email, u.preferred_language
     FROM users u
     JOIN user_preferences up ON up.user_id = u.id
     WHERE up.category_id IN (${placeholders})`,
    categoryIds
  );

  return rows;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateProfile,
  replacePreferences,
  getPreferenceCategoryIds,
  listUsersByPreferredCategories
};
