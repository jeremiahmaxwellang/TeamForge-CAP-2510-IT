const express = require('express');
const router = express.Router();

const coachController = require('../controllers/coachDashboardController');
const managerController = require('../controllers/managerDashboardController'); 

// Manager Dashboard API Routes
router.get('/api/players', managerController.getPlayerList); 
router.get('/api/announcements', coachController.getAnnouncements);
router.get('/api/draft', coachController.getDraft);

module.exports = router;