const pool = require('../config/db');

function buildCategoryJoin(categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return { sql: '', params: [] };
  }

  const placeholders = categoryIds.map(() => '?').join(',');
  return {
    sql: ` AND e.id IN (
      SELECT ec.event_id FROM event_categories ec WHERE ec.category_id IN (${placeholders})
    )`,
    params: categoryIds
  };
}

async function createEvent({ title, description, eventDate, latitude, longitude, creatorId, categoryIds }) {
  const [result] = await pool.execute(
    `INSERT INTO events (title, description, event_date, latitude, longitude, creator_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, eventDate, latitude, longitude, creatorId]
  );

  if (Array.isArray(categoryIds) && categoryIds.length) {
    const values = categoryIds.map((categoryId) => [result.insertId, categoryId]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flat = values.flat();
    await pool.execute(`INSERT INTO event_categories (event_id, category_id) VALUES ${placeholders}`, flat);
  }

  return getEventById(result.insertId);
}

async function getEventById(eventId) {
  const [rows] = await pool.execute(
    `SELECT e.*, u.name AS creator_name
     FROM events e
     JOIN users u ON u.id = e.creator_id
     WHERE e.id = ?`,
    [eventId]
  );

  if (!rows[0]) {
    return null;
  }

  const [categories] = await pool.execute(
    `SELECT c.id, c.name
     FROM categories c
     JOIN event_categories ec ON ec.category_id = c.id
     WHERE ec.event_id = ?`,
    [eventId]
  );

  return { ...rows[0], categories };
}

async function listEvents({ categoryIds }) {
  const categoryJoin = buildCategoryJoin(categoryIds);
  const [rows] = await pool.execute(
    `SELECT e.* FROM events e WHERE 1=1 ${categoryJoin.sql} ORDER BY e.event_date ASC`,
    categoryJoin.params
  );
  return rows;
}

async function updateEvent(eventId, { title, description, eventDate, latitude, longitude, categoryIds }) {
  await pool.execute(
    `UPDATE events
     SET title = COALESCE(?, title),
         description = COALESCE(?, description),
         event_date = COALESCE(?, event_date),
         latitude = COALESCE(?, latitude),
         longitude = COALESCE(?, longitude)
     WHERE id = ?`,
    [title ?? null, description ?? null, eventDate ?? null, latitude ?? null, longitude ?? null, eventId]
  );

  if (Array.isArray(categoryIds)) {
    await pool.execute('DELETE FROM event_categories WHERE event_id = ?', [eventId]);
    if (categoryIds.length > 0) {
      const values = categoryIds.map((categoryId) => [eventId, categoryId]);
      const placeholders = values.map(() => '(?, ?)').join(', ');
      const flat = values.flat();
      await pool.execute(`INSERT INTO event_categories (event_id, category_id) VALUES ${placeholders}`, flat);
    }
  }

  return getEventById(eventId);
}

async function deleteEvent(eventId) {
  await pool.execute('DELETE FROM events WHERE id = ?', [eventId]);
}

async function searchByRadius({ latitude, longitude, radiusKm, categoryIds }) {
  const categoryJoin = buildCategoryJoin(categoryIds);
  const [rows] = await pool.execute(
    `SELECT e.*, 
      ST_Distance_Sphere(point(e.longitude, e.latitude), point(?, ?)) / 1000 AS distance_km
     FROM events e
     WHERE ST_Distance_Sphere(point(e.longitude, e.latitude), point(?, ?)) <= (? * 1000)
      ${categoryJoin.sql}
     ORDER BY distance_km ASC, e.event_date ASC`,
    [longitude, latitude, longitude, latitude, radiusKm, ...categoryJoin.params]
  );
  return rows;
}

async function listUpcomingWithinHours(hours) {
  const [rows] = await pool.execute(
    `SELECT * FROM events
     WHERE event_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
     ORDER BY event_date ASC`,
    [hours]
  );
  return rows;
}

module.exports = {
  createEvent,
  getEventById,
  listEvents,
  updateEvent,
  deleteEvent,
  searchByRadius,
  listUpcomingWithinHours
};
