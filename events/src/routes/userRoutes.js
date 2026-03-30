const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/me', auth, userController.me);
router.patch('/me', auth, userController.updateProfileValidators, validate, userController.updateProfile);
router.put('/preferences', auth, userController.updatePreferencesValidators, validate, userController.updatePreferences);

module.exports = router;
