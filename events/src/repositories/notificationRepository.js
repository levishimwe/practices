const pool = require('../config/db');

async function createLog({ eventId, userId, notificationType, status = 'queued' }) {
  await pool.execute(
    `INSERT INTO notification_logs (event_id, user_id, notification_type, status)
     VALUES (?, ?, ?, ?)`,
    [eventId, userId, notificationType, status]
  );
}

module.exports = {
  createLog
};
