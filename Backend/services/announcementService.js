const Announcement = require('../models/Announcement');

class AnnouncementService {
  // Create new announcement
  async createAnnouncement(announcementData) {
    try {
      const announcement = new Announcement(announcementData);
      return await announcement.save();
    } catch (error) {
      throw new Error('Error creating announcement: ' + error.message);
    }
  }

  // Get announcement by ID
  async getAnnouncementById(announcementId) {
    try {
      return await Announcement.findById(announcementId);
    } catch (error) {
      throw new Error('Error fetching announcement: ' + error.message);
    }
  }

  // Get all announcements with filters
  async getAllAnnouncements(filters = {}, page = 1, limit = 10) {
    try {
      // Build query
      const query = { isActive: true };
      if (filters.course) query.course = filters.course;
      if (filters.semester) query.semester = filters.semester;
      if (filters.instructorName) query.instructorName = filters.instructorName;
      if (filters.priority) query.priority = filters.priority;
      if (filters.type) query.type = filters.type;
      // Handle date filters
      const now = new Date();
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ];
      const announcements = await Announcement.find(query).sort({ priority: -1, publishDate: -1 });
      return announcements;
    } catch (error) {
      throw new Error('Error fetching announcements: ' + error.message);
    }
  }

  // Update announcement
  async updateAnnouncement(announcementId, updateData) {
    try {
      return await Announcement.findByIdAndUpdate(
        announcementId,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error('Error updating announcement: ' + error.message);
    }
  }

  // Delete announcement
  async deleteAnnouncement(announcementId) {
    try {
      return await Announcement.findByIdAndDelete(announcementId);
    } catch (error) {
      throw new Error('Error deleting announcement: ' + error.message);
    }
  }
}

module.exports = new AnnouncementService();