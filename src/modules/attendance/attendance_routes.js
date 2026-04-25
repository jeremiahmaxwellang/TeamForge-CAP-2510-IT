const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance_controller');

// Route to load the webpage
router.get('/', attendanceController.getAttendancePage);

module.exports = router;