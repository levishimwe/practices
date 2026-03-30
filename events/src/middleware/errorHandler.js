module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || req.t('errors.serverError');

  return res.status(statusCode).json({
    success: false,
    message
  });
};
