const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const quizRoutes = require('./quizRoutes');
const announcementRoutes = require('./announcementRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/quizzes', quizRoutes);
router.use('/announcements', announcementRoutes);

module.exports = router;