const { body } = require('express-validator');
const categoryRepo = require('../repositories/categoryRepository');

const createCategoryValidators = [body('name').isString().isLength({ min: 2, max: 60 })];

async function list(req, res, next) {
  try {
    const categories = await categoryRepo.listCategories();
    return res.json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryRepo.createCategory(req.body.name);
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
