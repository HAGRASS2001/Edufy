const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get announcement by ID
router.get('/getById/:id', announcementController.getAnnouncementById);

// Create new announcement
router.post('/', announcementController.createAnnouncement);

// Update announcement
router.put('/:id', announcementController.updateAnnouncement);

// Delete announcement
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;