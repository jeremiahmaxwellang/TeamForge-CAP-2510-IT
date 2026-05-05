const express = require('express');
const router = express.Router();
const calendarController = require('./calendar_controller');

// Note: I haven't connected these routes to index.js yet

// Route to load the webpage
router.get('/', calendarController.getCalendarPage);

module.exports = router;