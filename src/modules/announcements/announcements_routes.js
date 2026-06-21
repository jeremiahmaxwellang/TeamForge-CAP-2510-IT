const express = require('express');
const router = express.Router();
const announcementController = require('./announcements_controller');

// Route to load the webpage
router.get('/', announcementController.getAnnouncementsPage);

// API Route to fetch the data
router.get('/api/getall', announcementController.getAllAnnouncements);

// API Route to create a new announcement
router.post('/api/create', announcementController.createAnnouncement);

// API Route to update an announcement
router.put('/api/update/:id', announcementController.updateAnnouncement);

// API Route to delete an announcement
router.delete('/api/delete/:id', announcementController.deleteAnnouncement);

module.exports = router;