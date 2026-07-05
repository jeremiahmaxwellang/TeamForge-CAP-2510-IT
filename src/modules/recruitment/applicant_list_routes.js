const express = require('express');
const router = express.Router();
const path = require('path');
const applicant_list_controller = require('./applicant_list_controller');
// Import playerController to reuse the "Get Player By ID" logic
const playerController = require('../../controllers/playerController');

// VIEW ROUTES (HTML Pages)

// Serve the Applicant List 
// URL: /applicant_list/
router.get('/', applicant_list_controller.getApplicantListPage);

// Serve the Applicant Profile 
// URL: /applicant_list/profile?id=123
router.get('/profile', applicant_list_controller.getApplicantProfile);

// Serve the Applicant List 
// URL: /applicant_list/
// router.get('/', (req, res) => {
//     res.sendFile(path.join(global.viewsPath, 'applicant_list.html'));
// });

// Serve the Applicant Profile 
// URL: /applicant_list/profile?id=123
// router.get('/profile', (req, res) => {
//     // Make sure 'applicant_profile.html' is in your views folder
//     res.sendFile(path.join(global.viewsPath, 'applicant_profile.html'));
// });

// API ROUTES 

// Get all applicants for the list
router.get('/getall', applicant_list_controller.getAllApplicants);

// Get applicant by email
router.get('/getbyemail', applicant_list_controller.getApplicantByEmail);

// Get specific Applicant Details by ID (Reuses Player Controller)
// URL: /applicant_list/details/4
router.get('/details/:id', playerController.getPlayerById);

// Save the latest VOD link for an applicant profile
router.post('/vod', applicant_list_controller.saveVodLink);

// Save Coach Evaluation (Accept/Reject & Notes)
router.post('/evaluate', applicant_list_controller.saveEvaluation);

// Get latest saved evaluation for a specific applicant
router.get('/evaluate/:userId', applicant_list_controller.getEvaluationByApplicant);

// Reject applicant
router.post('/reject', applicant_list_controller.rejectApplicant);

// Get ALL applicants + their stats specifically for the PDF Report
router.get('/report_data', applicant_list_controller.getReportData);

// Application Period Routes
router.get('/period/current',  applicant_list_controller.getCurrentPeriod);
router.post('/period/start',   applicant_list_controller.startNewPeriod);
router.put('/period/edit',     applicant_list_controller.editPeriodDates);
router.put('/period/end',      applicant_list_controller.endCurrentPeriod);

module.exports = router;