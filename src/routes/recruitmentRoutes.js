const express = require('express');
const router = express.Router();
const path = require('path');
const recruitmentController = require('../controllers/recruitment/recruitmentController');

// Get current application period
router.get('/getperiod', recruitmentController.getApplicationPeriod);

module.exports = router;