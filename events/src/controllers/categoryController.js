const { body } = require('express-validator');
const { Category } = require('../models');

const createCategoryValidators = [body('name').isString().isLength({ min: 2, max: 60 })];

async function list(req, res, next) {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    return res.json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const category = await Category.create({ name: req.body.name });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCategoryValidators,
  list,
  create
};
