const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: String, required: true },
  instructor: { type: String, required: true },
  semester: { type: String, required: true },
  duration: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  studentMarks: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category: { type: String, enum: ['assignment', 'practice', 'midterm', 'final'], default: 'assignment' },
  isPublished: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  tags: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);