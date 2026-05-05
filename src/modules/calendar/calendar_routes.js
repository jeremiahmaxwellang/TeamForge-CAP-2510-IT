const express = require('express');
const router = express.Router();
const calendarController = require('./calendar_controller');

// Route to load the webpage
router.get('/', calendarController.getCalendarPage);

module.exports = router;