const express = require('express');
const router = express.Router();
const path = require('path'); 

const reports_controller = require('./reports_controller');

router.get('/', reports_controller.getReportsPage);

router.get('/current_players', reports_controller.getCurrentPlayers);
router.get('/applicant_roles', reports_controller.getApplicantRoles);
router.get('/applicant_statuses', reports_controller.getApplicantStatuses);
router.get('/applications_total', reports_controller.getApplicationsEachPeriod);
router.get('/best_performing_applicants', reports_controller.getBestPerformingApplicants);
router.get('/best_communication_applicants', reports_controller.getBestCommunicationApplicants);
router.get('/tournament_results', reports_controller.getTournamentResultsReport); // changed to cap2 events table

// Reports
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'reports.html'));
});


module.exports = router;