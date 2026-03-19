const express = require('express');
const router = express.Router();
const path = require('path'); 

const reports_controller = require('../controllers/reports_controller');

router.get('/applicant_roles', reports_controller.getApplicantRoles);

// Reports 
// TODO: requireRole('Team Coach')
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'reports.html'));
});


module.exports = router;