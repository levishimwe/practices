const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const categoryRoutes = require('./categoryRoutes');
const favoriteRoutes = require('./favoriteRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;
