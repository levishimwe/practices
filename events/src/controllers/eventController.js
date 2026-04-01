const { body, param, query } = require('express-validator');
const { Event, User, Category, Sequelize, Op } = require('../models');
const notificationService = require('../services/notificationService');
const ApiError = require('../utils/ApiError');

const createEventValidators = [
  body('title').isString().isLength({ min: 2, max: 120 }),
  body('description').optional().isString(),
  body('eventDate').isISO8601(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('categoryIds').isArray({ min: 1 })
];

const updateEventValidators = [
  param('id').isInt({ min: 1 }),
  body('title').optional().isString().isLength({ min: 2, max: 120 }),
  body('description').optional().isString(),
  body('eventDate').optional().isISO8601(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('categoryIds').optional().isArray()
];

const deleteEventValidators = [param('id').isInt({ min: 1 })];
const getEventValidators = [param('id').isInt({ min: 1 })];

const searchValidators = [
  query('latitude').isFloat({ min: -90, max: 90 }),
  query('longitude').isFloat({ min: -180, max: 180 }),
  query('radiusKm').isFloat({ min: 0.1, max: 500 }),
  query('categoryIds').optional().isString()
];

function parseCategoryIds(raw) {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map(Number).filter(Number.isFinite);
  }
  return String(raw)
    .split(',')
    .map((v) => Number(v.trim()))
    .filter(Number.isFinite);
}

function toEventResponse(event) {
  const data = event.toJSON();
  return {
    ...data,
    event_date: data.start_time,
    eventDate: data.start_time,
    creator_name: data.creator?.name,
    categories: data.categories || []
  };
}

async function create(req, res, next) {
  try {
    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      start_time: req.body.eventDate,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      location_name: req.body.location_name,
      end_time: req.body.end_time,
      creator_id: req.user.userId
    });

    if (Array.isArray(req.body.categoryIds)) {
      const categories = await Category.findAll({ where: { id: req.body.categoryIds } });
      await event.setCategories(categories);
    }

    const hydrated = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name'] }
      ]
    });

    await notificationService.enqueueEventNotification(toEventResponse(hydrated));

    return res.status(201).json({
      success: true,
      message: req.t('event.created'),
      data: toEventResponse(hydrated)
    });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const categoryIds = parseCategoryIds(req.query.categoryIds);

    const include = [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
        attributes: ['id', 'name'],
        ...(categoryIds.length ? { where: { id: categoryIds } } : {})
      }
    ];

    const events = await Event.findAll({
      include,
      order: [['start_time', 'ASC']],
      ...(categoryIds.length ? { distinct: true } : {})
    });
    return res.json({ success: true, data: events.map(toEventResponse) });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const event = await Event.findByPk(Number(req.params.id), {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name'] }
      ]
    });
    if (!event) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    return res.json({ success: true, data: toEventResponse(event) });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const current = await Event.findByPk(eventId);
    if (!current) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    if (current.creator_id !== req.user.userId) {
      throw new ApiError(403, req.t('errors.forbidden'));
    }

    await current.update({
      title: req.body.title ?? current.title,
      description: req.body.description ?? current.description,
      start_time: req.body.eventDate ?? current.start_time,
      latitude: req.body.latitude ?? current.latitude,
      longitude: req.body.longitude ?? current.longitude,
      location_name: req.body.location_name ?? current.location_name,
      end_time: req.body.end_time ?? current.end_time
    });

    if (Array.isArray(req.body.categoryIds)) {
      const categories = await Category.findAll({ where: { id: req.body.categoryIds } });
      await current.setCategories(categories);
    }

    const updated = await Event.findByPk(eventId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name'] }
      ]
    });

    return res.json({ success: true, message: req.t('event.updated'), data: toEventResponse(updated) });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const current = await Event.findByPk(eventId);
    if (!current) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    if (current.creator_id !== req.user.userId) {
      throw new ApiError(403, req.t('errors.forbidden'));
    }

    await current.destroy();
    return res.json({ success: true, message: req.t('event.deleted') });
  } catch (error) {
    return next(error);
  }
}

async function search(req, res, next) {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Number(req.query.radiusKm);
    const categoryIds = parseCategoryIds(req.query.categoryIds);

    const distanceExpression = `ST_Distance_Sphere(point(\`Event\`.\`longitude\`, \`Event\`.\`latitude\`), point(${longitude}, ${latitude})) / 1000`;

    const where = Sequelize.where(
      Sequelize.literal(distanceExpression),
      { [Op.lte]: radiusKm }
    );

    const include = [
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
        attributes: ['id', 'name'],
        ...(categoryIds.length ? { where: { id: categoryIds } } : {})
      }
    ];

    const events = await Event.findAll({
      where,
      include,
      order: [[Sequelize.literal(distanceExpression), 'ASC'], ['start_time', 'ASC']]
    });
    return res.json({ success: true, data: events.map(toEventResponse) });
  } catch (error) {
    return next(error);
  }
}

async function notifyUpcoming(req, res, next) {
  try {
    const hours = Number(req.body?.hours || 24);
    const count = await notificationService.enqueueUpcomingNotifications(hours);
    return res.json({
      success: true,
      message: `Queued notifications for ${count} event(s)`
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createEventValidators,
  updateEventValidators,
  deleteEventValidators,
  getEventValidators,
  searchValidators,
  create,
  list,
  getById,
  update,
  remove,
  search,
  notifyUpcoming
};
