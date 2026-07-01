const express = require('express');
const router = express.Router();
const settingsController = require('./settings_controller');

function requireCoachOnly(req, res, next) {
    const role = req.cookies && req.cookies.userRole;
    if (role !== 'Team Coach') {
        return res.status(403).json({ success: false, message: 'Only Team Coaches can access these settings.' });
    }
    return next();
}

function requireManagerOrCoach(req, res, next) {
    const role = req.cookies && req.cookies.userRole;
    if (role !== 'Team Manager' && role !== 'Team Coach') {
        return res.status(403).json({
            success: false,
            message: 'Only Team Managers and Team Coaches can access these settings.'
        });
    }
    return next();
}

// Serve the HTML page
router.get('/', settingsController.getPage);
router.get('/api/all-team-details', settingsController.getAllTeamDetails);

router.post('/api/profile/password', settingsController.changePassword);
router.post('/api/profile/photo', settingsController.changeProfilePhoto);

router.post('/api/school/name', settingsController.changeSchoolName);
router.post('/api/school/icon', settingsController.changeSchoolIcon);

router.get('/api/team-details', settingsController.getTeamDetails);
router.post('/api/team-details', settingsController.updateTeamDetails);
router.get('/api/riot-api-key', settingsController.getRiotApiKeyStatus);
router.post('/api/riot-api-key', settingsController.updateRiotApiKey);

// For the dynamic academic terms
router.get('/api/academic-requirements', requireCoachOnly, settingsController.getAcademicRequirements);
router.post('/api/academic-requirements', requireCoachOnly, settingsController.updateAcademicRequirements);

router.get('/api/academic-terms', requireManagerOrCoach, settingsController.getAcademicTerms);
router.post('/api/academic-terms', requireManagerOrCoach, settingsController.updateAcademicTerms);

// API Endpoints
router.get('/api/benchmarks/:roleId', requireCoachOnly, settingsController.getBenchmarksByRole);
router.post('/api/benchmarks/update', requireCoachOnly, settingsController.updateBenchmarks);

router.get('/api/display-preferences', settingsController.getDisplayPreferences);
router.post('/api/display-preferences', settingsController.updateDisplayPreferences);

module.exports = router;