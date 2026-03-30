const { body } = require('express-validator');
const userRepo = require('../repositories/userRepository');

const updateProfileValidators = [
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('preferredLanguage').optional().isIn(['en', 'es'])
];

const updatePreferencesValidators = [body('categoryIds').isArray()];

async function me(req, res, next) {
  try {
    const user = await userRepo.findById(req.user.userId);
    const preferenceCategoryIds = await userRepo.getPreferenceCategoryIds(req.user.userId);

    return res.json({
      success: true,
      data: {
        ...user,
        preferenceCategoryIds
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userRepo.updateProfile(req.user.userId, req.body);
    return res.json({
      success: true,
      message: req.t('user.updated'),
      data: user
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    await userRepo.replacePreferences(req.user.userId, req.body.categoryIds);
    return res.json({
      success: true,
      message: req.t('user.preferencesUpdated')
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  updateProfileValidators,
  updatePreferencesValidators,
  me,
  updateProfile,
  updatePreferences
};
