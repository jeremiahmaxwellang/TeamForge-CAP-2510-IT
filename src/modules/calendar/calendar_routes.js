const express = require('express');
const router = express.Router();
const path = require('path');
const calendarController = require('./calendar_controller');

// Serve the Calendar HTML page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html')); 
});

// API route to create a new event
router.post('/api/create', calendarController.createEvent);

module.exports = router;