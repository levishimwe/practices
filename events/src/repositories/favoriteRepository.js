const pool = require('../config/db');

async function addFavorite(userId, eventId) {
  await pool.execute(
    `INSERT IGNORE INTO favorites (user_id, event_id) VALUES (?, ?)`,
    [userId, eventId]
  );
}

async function removeFavorite(userId, eventId) {
  await pool.execute(
    `DELETE FROM favorites WHERE user_id = ? AND event_id = ?`,
    [userId, eventId]
  );
}

async function listFavorites(userId) {
  const [rows] = await pool.execute(
    `SELECT e.*
     FROM favorites f
     JOIN events e ON e.id = f.event_id
     WHERE f.user_id = ?
     ORDER BY e.event_date ASC`,
    [userId]
  );
  return rows;
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites
};
