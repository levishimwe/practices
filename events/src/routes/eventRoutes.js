const express = require('express');
const eventController = require('../controllers/eventController');
const reviewController = require('../controllers/reviewController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', eventController.list);
router.get('/search', eventController.searchValidators, validate, eventController.search);
router.get('/:id', eventController.getEventValidators, validate, eventController.getById);
router.post('/', auth, eventController.createEventValidators, validate, eventController.create);
router.post('/notifications/upcoming', auth, eventController.notifyUpcoming);
router.patch('/:id', auth, eventController.updateEventValidators, validate, eventController.update);
router.delete('/:id', auth, eventController.deleteEventValidators, validate, eventController.remove);

router.get('/:eventId/reviews', reviewController.listReviewValidators, validate, reviewController.list);
router.post('/:eventId/reviews', auth, reviewController.addReviewValidators, validate, reviewController.add);

module.exports = router;
