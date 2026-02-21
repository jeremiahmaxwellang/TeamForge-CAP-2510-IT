const express = require('express');
const router = express.Router();
const path = require('path');
const applicant_listController = require('../controllers/applicant_listController');

// Route to serve the applicant list page
router.get('/', (req, res) => {
    res.sendFile(path.join(global.viewsPath, 'applicant_list.html'));
});

// Route to get all applicants (API)
router.get('/getall', applicant_listController.getAllApplicants);

// Route to get applicant by email (API)
router.get('/getbyemail', applicant_listController.getApplicantByEmail);

module.exports = router;
