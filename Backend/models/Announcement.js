const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  instructorName: { type: String, required: true },
  course: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  type: { type: String, enum: ['general', 'assignment', 'exam', 'event', 'deadline'], default: 'general' },
  isActive: { type: Boolean, default: true },
  semester: { type: String, required: true },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  tags: [{ type: String }],
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);