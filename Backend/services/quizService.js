const Quiz = require('../models/Quiz');

class QuizService {
  // Create new quiz
  async createQuiz(quizData) {
    try {
      const quiz = new Quiz(quizData);
      return await quiz.save();
    } catch (error) {
      throw new Error('Error creating quiz: ' + error.message);
    }
  }

  // Get quiz by ID
  async getQuizById(quizId) {
    try {
      return await Quiz.findById(quizId);
    } catch (error) {
      throw new Error('Error fetching quiz: ' + error.message);
    }
  }

  // Get all quizzes with filters
  async getAllQuizzes(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      if (filters.course) query.course = filters.course;
      if (filters.semester) query.semester = filters.semester;
      if (filters.instructor) query.instructor = filters.instructor;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.category) query.category = filters.category;
      if (filters.assignedStudent) query.assignedStudents = filters.assignedStudent;

      const quizzes = await Quiz.find(query);

      return {
        quizzes
      };
    } catch (error) {
      throw new Error('Error fetching quizzes: ' + error.message);
    }
  }

  // Update quiz
  async updateQuiz(quizId, updateData) {
    try {
      return await Quiz.findByIdAndUpdate(
        quizId,
        updateData
      );
    } catch (error) {
      throw new Error('Error updating quiz: ' + error.message);
    }
  }

  // Delete quiz
  async deleteQuiz(quizId) {
    try {
      return await Quiz.findByIdAndDelete(quizId);
    } catch (error) {
      throw new Error('Error deleting quiz: ' + error.message);
    }
  }
}

module.exports = new QuizService();