const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance_controller');

// Route to load the webpage
router.get('/', attendanceController.getAttendancePage);

// Attendance API
router.get('/api/events', attendanceController.getAttendanceEvents);
router.get('/api/events/:id/participants', attendanceController.getEventParticipants);

module.exports = router;