const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Serve the HTML page
router.get('/', (req, res) => {
    res.sendFile('user_settings.html', { root: './views' }); 
});

// API Endpoints
router.get('/api/benchmarks/:roleId', settingsController.getBenchmarksByRole);
router.post('/api/benchmarks/update', settingsController.updateBenchmarks);

module.exports = router;