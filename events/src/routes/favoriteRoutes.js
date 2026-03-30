const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', auth, favoriteController.list);
router.post('/:eventId', auth, favoriteController.favoriteValidators, validate, favoriteController.add);
router.delete('/:eventId', auth, favoriteController.favoriteValidators, validate, favoriteController.remove);

module.exports = router;
