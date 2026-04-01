const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserPreference } = require('../models');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

function toSafeUser(user) {
  const data = user.toJSON();
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    latitude: data.latitude,
    longitude: data.longitude,
    preferred_language: data.language,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

async function register(payload) {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: passwordHash,
    latitude: payload.latitude,
    longitude: payload.longitude,
    language: payload.preferredLanguage || 'en'
  });

  if (Array.isArray(payload.preferredCategoryIds)) {
    await UserPreference.destroy({ where: { user_id: user.id } });
    if (payload.preferredCategoryIds.length > 0) {
      await UserPreference.bulkCreate(
        payload.preferredCategoryIds.map((categoryId) => ({
          user_id: user.id,
          category_id: categoryId
        }))
      );
    }
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

  return { user: toSafeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
  return { user: toSafeUser(user), token };
}

module.exports = {
  register,
  login
};
