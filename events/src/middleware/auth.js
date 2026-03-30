const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, req.t('errors.unauthorized')));
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return next(new ApiError(401, req.t('errors.invalidToken')));
  }
};
