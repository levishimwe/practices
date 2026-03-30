const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register', authController.registerValidators, validate, authController.register);
router.post('/login', authController.loginValidators, validate, authController.login);

module.exports = router;
