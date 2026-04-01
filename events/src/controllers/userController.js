const { body } = require('express-validator');
const { User, UserPreference } = require('../models');

const updateProfileValidators = [
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('preferredLanguage').optional().isIn(['en', 'es'])
];

const updatePreferencesValidators = [body('categoryIds').isArray()];

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.userId);
    const preferences = await UserPreference.findAll({
      where: { user_id: req.user.userId },
      attributes: ['category_id']
    });
    const preferenceCategoryIds = preferences.map((preference) => preference.category_id);
    const userData = user.toJSON();

    return res.json({
      success: true,
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        latitude: userData.latitude,
        longitude: userData.longitude,
        preferred_language: userData.language,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        preferenceCategoryIds
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.userId);
    await user.update({
      latitude: req.body.latitude ?? user.latitude,
      longitude: req.body.longitude ?? user.longitude,
      language: req.body.preferredLanguage ?? user.language
    });

    const data = user.toJSON();
    return res.json({
      success: true,
      message: req.t('user.updated'),
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
        preferred_language: data.language,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    await UserPreference.destroy({ where: { user_id: req.user.userId } });

    if (Array.isArray(req.body.categoryIds) && req.body.categoryIds.length > 0) {
      await UserPreference.bulkCreate(
        req.body.categoryIds.map((categoryId) => ({
          user_id: req.user.userId,
          category_id: categoryId
        }))
      );
    }

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
