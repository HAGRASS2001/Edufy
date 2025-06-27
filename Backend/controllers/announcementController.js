const announcementService = require('../services/announcementService');

// Controller methods for Announcement
const announcementController = {
    // Get all announcements
    getAllAnnouncements: async (req, res) => {
        try {
            const announcements = await announcementService.getAllAnnouncements();
            console.log(announcements);
            res.json(announcements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get announcement by ID
    getAnnouncementById: async (req, res) => {
        try {
            const announcement = await announcementService.getAnnouncementById(req.params.id);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }
            res.json(announcement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new announcement
    createAnnouncement: async (req, res) => {
        try {
            const announcement = await announcementService.createAnnouncement(req.body);
            res.status(201).json(announcement);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update announcement
    updateAnnouncement: async (req, res) => {
        try {
            const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }
            res.json(announcement);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete announcement
    deleteAnnouncement: async (req, res) => {
        try {
            const announcement = await announcementService.deleteAnnouncement(req.params.id);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }
            res.json({ message: 'Announcement deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = announcementController;