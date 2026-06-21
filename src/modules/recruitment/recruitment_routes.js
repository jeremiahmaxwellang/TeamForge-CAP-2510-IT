const express = require('express');
const router = express.Router();
const path = require('path');
const recruitmentController = require('./recruitment_controller');

// Get current application period
router.get('/getperiod', recruitmentController.getApplicationPeriod);

module.exports = router;