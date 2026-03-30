const { param } = require('express-validator');
const favoriteRepo = require('../repositories/favoriteRepository');

const favoriteValidators = [param('eventId').isInt({ min: 1 })];

async function add(req, res, next) {
  try {
    await favoriteRepo.addFavorite(req.user.userId, Number(req.params.eventId));
    return res.status(201).json({ success: true, message: req.t('favorite.added') });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await favoriteRepo.removeFavorite(req.user.userId, Number(req.params.eventId));
    return res.json({ success: true, message: req.t('favorite.removed') });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const favorites = await favoriteRepo.listFavorites(req.user.userId);
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
