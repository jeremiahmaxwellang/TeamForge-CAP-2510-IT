const express = require('express');
const router = express.Router();
const path = require('path');
const applicant_listController = require('../controllers/applicant_listController');
// Import playerController to reuse the "Get Player By ID" logic
const playerController = require('../controllers/playerController');

// VIEW ROUTES (HTML Pages)

// Serve the Applicant List 
// URL: /applicant_list/
router.get('/', (req, res) => {
    res.sendFile(path.join(global.viewsPath, 'applicant_list.html'));
});

// Serve the Applicant Profile 
// URL: /applicant_list/profile?id=123
router.get('/profile', (req, res) => {
    // Make sure 'applicant_profile.html' is in your views folder
    res.sendFile(path.join(global.viewsPath, 'applicant_profile.html'));
});

// API ROUTES 

// Get all applicants for the list
router.get('/getall', applicant_listController.getAllApplicants);

// Get applicant by email
router.get('/getbyemail', applicant_listController.getApplicantByEmail);

// Get specific Applicant Details by ID (Reuses Player Controller)
// URL: /applicant_list/details/4
router.get('/details/:id', playerController.getPlayerById);

// Save Coach Evaluation (Accept/Reject & Notes)
router.post('/evaluate', applicant_listController.saveEvaluation);

// Get latest saved evaluation for a specific applicant
router.get('/evaluate/:userId', applicant_listController.getEvaluationByApplicant);

// Reject applicant
router.post('/reject', applicant_listController.rejectApplicant);

// Get ALL applicants + their stats specifically for the PDF Report
router.get('/report_data', applicant_listController.getReportData);

module.exports = router;