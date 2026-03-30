const { body, param } = require('express-validator');
const reviewRepo = require('../repositories/reviewRepository');

const addReviewValidators = [
  param('eventId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().isLength({ max: 500 })
];

const listReviewValidators = [param('eventId').isInt({ min: 1 })];

async function add(req, res, next) {
  try {
    const review = await reviewRepo.addReview({
      eventId: Number(req.params.eventId),
      userId: req.user.userId,
      rating: Number(req.body.rating),
      comment: req.body.comment || null
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const reviews = await reviewRepo.listReviewsByEvent(Number(req.params.eventId));
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addReviewValidators,
  listReviewValidators,
  add,
  list
};
