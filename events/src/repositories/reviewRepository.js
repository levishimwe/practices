const pool = require('../config/db');

async function addReview({ eventId, userId, rating, comment }) {
  await pool.execute(
    `INSERT INTO reviews (event_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
    [eventId, userId, rating, comment]
  );

  const [rows] = await pool.execute(
    'SELECT id, event_id, user_id, rating, comment FROM reviews WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  return rows[0];
}

async function listReviewsByEvent(eventId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.id AS user_id, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ?
     ORDER BY r.created_at DESC`,
    [eventId]
  );

  return rows;
}

module.exports = {
  addReview,
  listReviewsByEvent
};
