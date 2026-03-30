const { body } = require('express-validator');
const authService = require('../services/authService');

const registerValidators = [
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('preferredLanguage').optional().isIn(['en', 'es']),
  body('preferredCategoryIds').optional().isArray()
];

const loginValidators = [body('email').isEmail(), body('password').isString().isLength({ min: 6 })];

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: req.t('auth.registered'),
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: req.t('auth.loggedIn'),
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerValidators,
  loginValidators,
  register,
  login
};
