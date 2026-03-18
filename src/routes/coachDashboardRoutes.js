const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/coachDashboardController');

// Serve the HTML page
router.get('/', (req, res) => {
    res.sendFile('coach_dashboard.html', { root: './views' }); 
});

// API Endpoints
router.get('/api/players', dashboardController.getPlayerList);
router.get('/api/draft', dashboardController.getDraft);
router.get('/api/scrims', dashboardController.getLatestScrims);
router.get('/api/stats', dashboardController.getTeamStats);
router.get('/api/announcements', dashboardController.getAnnouncements);

module.exports = router;