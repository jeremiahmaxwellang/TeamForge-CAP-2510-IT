const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

function requireCoachForBenchmarks(req, res, next) {
    const role = req.cookies && req.cookies.userRole;
    if (role !== 'Team Coach') {
        return res.status(403).json({ success: false, message: 'Only Team Coaches can access benchmark settings.' });
    }
    return next();
}

// Serve the HTML page
router.get('/', (req, res) => {
    res.sendFile('user_settings.html', { root: './views' }); 
});

router.post('/api/profile/password', settingsController.changePassword);
router.post('/api/profile/photo', settingsController.changeProfilePhoto);
router.get('/api/riot-api-key', settingsController.getRiotApiKeyStatus);
router.post('/api/riot-api-key', settingsController.updateRiotApiKey);

// API Endpoints
router.get('/api/benchmarks/:roleId', requireCoachForBenchmarks, settingsController.getBenchmarksByRole);
router.post('/api/benchmarks/update', requireCoachForBenchmarks, settingsController.updateBenchmarks);

module.exports = router;