const express = require('express');
const router = express.Router();

// Reuse the Coach's controller logic since the data needs are currently identical
const coachController = require('../controllers/coachDashboardController');

// Manager Dashboard API Routes
router.get('/api/players', coachController.getPlayerList); 
router.get('/api/announcements', coachController.getAnnouncements);
router.get('/api/draft', coachController.getDraft);

module.exports = router;