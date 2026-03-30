const { body, param, query } = require('express-validator');
const eventRepo = require('../repositories/eventRepository');
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

async function create(req, res, next) {
  try {
    const event = await eventRepo.createEvent({
      ...req.body,
      creatorId: req.user.userId
    });

    await notificationService.enqueueEventNotification(event);

    return res.status(201).json({
      success: true,
      message: req.t('event.created'),
      data: event
    });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const categoryIds = parseCategoryIds(req.query.categoryIds);
    const events = await eventRepo.listEvents({ categoryIds });
    return res.json({ success: true, data: events });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const event = await eventRepo.getEventById(Number(req.params.id));
    if (!event) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    return res.json({ success: true, data: event });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const current = await eventRepo.getEventById(eventId);
    if (!current) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    if (current.creator_id !== req.user.userId) {
      throw new ApiError(403, req.t('errors.forbidden'));
    }

    const updated = await eventRepo.updateEvent(eventId, req.body);
    return res.json({ success: true, message: req.t('event.updated'), data: updated });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const current = await eventRepo.getEventById(eventId);
    if (!current) {
      throw new ApiError(404, req.t('event.notFound'));
    }
    if (current.creator_id !== req.user.userId) {
      throw new ApiError(403, req.t('errors.forbidden'));
    }

    await eventRepo.deleteEvent(eventId);
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

    const events = await eventRepo.searchByRadius({ latitude, longitude, radiusKm, categoryIds });
    return res.json({ success: true, data: events });
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
