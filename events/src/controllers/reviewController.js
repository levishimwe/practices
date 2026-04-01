const { body, param } = require('express-validator');
const { Review, User } = require('../models');

const addReviewValidators = [
  param('eventId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().isLength({ max: 500 })
];

const listReviewValidators = [param('eventId').isInt({ min: 1 })];

async function add(req, res, next) {
  try {
    const payload = {
      event_id: Number(req.params.eventId),
      user_id: req.user.userId,
      rating: Number(req.body.rating),
      comment: req.body.comment || null
    };

    const existing = await Review.findOne({
      where: { event_id: payload.event_id, user_id: payload.user_id }
    });

    let review;
    if (existing) {
      review = await existing.update(payload);
    } else {
      review = await Review.create(payload);
    }

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const reviews = await Review.findAll({
      where: { event_id: Number(req.params.eventId) },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user_id: review.user?.id,
        user_name: review.user?.name
      }))
    });
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
