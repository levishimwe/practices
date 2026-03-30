const express = require('express');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.list);
router.post('/', auth, categoryController.createCategoryValidators, validate, categoryController.create);

module.exports = router;
