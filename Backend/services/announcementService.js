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
      const skip = (page - 1) * limit;
      
      // Build query
      const query = { isActive: true };
      if (filters.course) query.course = filters.course;
      if (filters.semester) query.semester = filters.semester;
      if (filters.instructorName) query.instructorName = filters.instructorName;
      if (filters.priority) query.priority = filters.priority;
      if (filters.type) query.type = filters.type;

      // Handle date filters
      const now = new Date();
      query.publishDate = { $lte: now };
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ];

      const announcements = await Announcement.find(query)
        .sort({ priority: -1, publishDate: -1 });


      return announcements;
    } catch (error) {
      throw new Error('Error fetching announcements: ' + error.message);
    }
  }

  // Get active announcements for current semester
  async getActiveAnnouncements(semester, course = null) {
    try {
      const now = new Date();
      const query = {
        isActive: true,
        semester,
        publishDate: { $lte: now },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: now } }
        ]
      };

      if (course) {
        query.course = course;
      }

      return await Announcement.find(query)
        .sort({ priority: -1, publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching active announcements: ' + error.message);
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

  // Deactivate announcement
  async deactivateAnnouncement(announcementId) {
    try {
      return await Announcement.findByIdAndUpdate(
        announcementId,
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error deactivating announcement: ' + error.message);
    }
  }

  // Get announcements by course
  async getAnnouncementsByCourse(course, semester) {
    try {
      const now = new Date();
      return await Announcement.find({
        course,
        semester,
        isActive: true,
        publishDate: { $lte: now },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: now } }
        ]
      }).sort({ priority: -1, publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching announcements by course: ' + error.message);
    }
  }

  // Get announcements by instructor
  async getAnnouncementsByInstructor(instructorName, semester) {
    try {
      return await Announcement.find({
        instructorName,
        semester,
        isActive: true
      }).sort({ publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching announcements by instructor: ' + error.message);
    }
  }

  // Get high priority announcements
  async getHighPriorityAnnouncements(semester) {
    try {
      const now = new Date();
      return await Announcement.find({
        priority: 'high',
        semester,
        isActive: true,
        publishDate: { $lte: now },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: now } }
        ]
      }).sort({ publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching high priority announcements: ' + error.message);
    }
  }

  // Get announcements by type
  async getAnnouncementsByType(type, semester) {
    try {
      const now = new Date();
      return await Announcement.find({
        type,
        semester,
        isActive: true,
        publishDate: { $lte: now },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: now } }
        ]
      }).sort({ publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching announcements by type: ' + error.message);
    }
  }

  // Search announcements
  async searchAnnouncements(searchTerm, filters = {}) {
    try {
      const query = {
        isActive: true,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { course: { $regex: searchTerm, $options: 'i' } },
          { instructorName: { $regex: searchTerm, $options: 'i' } }
        ],
        ...filters
      };

      return await Announcement.find(query)
        .sort({ priority: -1, publishDate: -1 });
    } catch (error) {
      throw new Error('Error searching announcements: ' + error.message);
    }
  }

  // Get recent announcements
  async getRecentAnnouncements(semester, days = 7) {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      return await Announcement.find({
        semester,
        isActive: true,
        publishDate: { $gte: dateThreshold }
      }).sort({ publishDate: -1 });
    } catch (error) {
      throw new Error('Error fetching recent announcements: ' + error.message);
    }
  }

  // Get announcement statistics
  async getAnnouncementStatistics(semester) {
    try {
      const totalActive = await Announcement.countDocuments({
        semester,
        isActive: true
      });

      const byPriority = await Announcement.aggregate([
        { $match: { semester, isActive: true } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      const byType = await Announcement.aggregate([
        { $match: { semester, isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      return {
        totalActive,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error('Error fetching announcement statistics: ' + error.message);
    }
  }

  // Schedule announcement (set future publish date)
  async scheduleAnnouncement(announcementData, publishDate) {
    try {
      announcementData.publishDate = publishDate;
      const announcement = new Announcement(announcementData);
      return await announcement.save();
    } catch (error) {
      throw new Error('Error scheduling announcement: ' + error.message);
    }
  }

  // Get scheduled announcements
  async getScheduledAnnouncements(semester) {
    try {
      const now = new Date();
      return await Announcement.find({
        semester,
        isActive: true,
        publishDate: { $gt: now }
      }).sort({ publishDate: 1 });
    } catch (error) {
      throw new Error('Error fetching scheduled announcements: ' + error.message);
    }
  }
}

module.exports = new AnnouncementService();