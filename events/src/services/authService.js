const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

async function register(payload) {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) {
    throw new ApiError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const userId = await userRepo.createUser({
    name: payload.name,
    email: payload.email,
    passwordHash,
    latitude: payload.latitude,
    longitude: payload.longitude,
    preferredLanguage: payload.preferredLanguage || 'en'
  });

  if (Array.isArray(payload.preferredCategoryIds)) {
    await userRepo.replacePreferences(userId, payload.preferredCategoryIds);
  }

  const user = await userRepo.findById(userId);
  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

  return { user, token };
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
  const cleanUser = await userRepo.findById(user.id);
  return { user: cleanUser, token };
}

module.exports = {
  register,
  login
};
