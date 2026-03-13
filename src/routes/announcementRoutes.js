const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Route to load the webpage
router.get('/', announcementController.getAnnouncementsPage);

// API Route to fetch the data
router.get('/api/getall', announcementController.getAllAnnouncements);

// API Route to create a new announcement
router.post('/api/create', announcementController.createAnnouncement);

module.exports = router;