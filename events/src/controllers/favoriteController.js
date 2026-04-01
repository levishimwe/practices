const { param } = require('express-validator');
const { Favorite, Event } = require('../models');

const favoriteValidators = [param('eventId').isInt({ min: 1 })];

async function add(req, res, next) {
  try {
    await Favorite.findOrCreate({
      where: {
        user_id: req.user.userId,
        event_id: Number(req.params.eventId)
      }
    });
    return res.status(201).json({ success: true, message: req.t('favorite.added') });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await Favorite.destroy({
      where: {
        user_id: req.user.userId,
        event_id: Number(req.params.eventId)
      }
    });
    return res.json({ success: true, message: req.t('favorite.removed') });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const favorites = await Event.findAll({
      include: [
        {
          association: 'favoritedByUsers',
          where: { id: req.user.userId },
          attributes: [],
          through: { attributes: [] }
        }
      ],
      order: [['start_time', 'ASC']]
    });
    return res.json({ success: true, data: favorites });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  favoriteValidators,
  add,
  remove,
  list
};
