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
      if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

      const quizzes = await Quiz.find(query);

      return {
        quizzes
      };
    } catch (error) {
      throw new Error('Error fetching quizzes: ' + error.message);
    }
  }

  // Get published quizzes for students
  async getPublishedQuizzes(semester, course = null) {
    try {
      const query = {
        isPublished: true,
        semester,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      };

      if (course) {
        query.course = course;
      }

      return await Quiz.find(query).sort({ startDate: 1 });
    } catch (error) {
      throw new Error('Error fetching published quizzes: ' + error.message);
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

  // Publish/Unpublish quiz
  async toggleQuizPublication(quizId, isPublished) {
    try {
      return await Quiz.findByIdAndUpdate(
        quizId,
        { isPublished }
      );
    } catch (error) {
      throw new Error('Error toggling quiz publication: ' + error.message);
    }
  }

  // Get quizzes by course
  async getQuizzesByCourse(course, semester) {
    try {
      return await Quiz.find({ 
        course, 
        semester,
        isPublished: true 
      }).sort({ startDate: 1 });
    } catch (error) {
      throw new Error('Error fetching quizzes by course: ' + error.message);
    }
  }

  // Get quizzes by instructor
  async getQuizzesByInstructor(instructor, semester) {
    try {
      return await Quiz.find({ 
        instructor, 
        semester 
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching quizzes by instructor: ' + error.message);
    }
  }

  // Get quiz statistics
  async getQuizStatistics(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // This would typically involve aggregating data from QuizAttempt collection
      // For now, returning basic quiz info
      return {
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        difficulty: quiz.difficulty,
        category: quiz.category
      };
    } catch (error) {
      throw new Error('Error fetching quiz statistics: ' + error.message);
    }
  }
/*
  // Search quizzes
  async searchQuizzes(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { course: { $regex: searchTerm, $options: 'i' } },
          { instructor: { $regex: searchTerm, $options: 'i' } }
        ],
        ...filters
      };

      return await Quiz.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error searching quizzes: ' + error.message);
    }
  }
*/
  // Get quiz by difficulty level
  async getQuizzesByDifficulty(difficulty, semester) {
    try {
      return await Quiz.find({ 
        difficulty, 
        semester,
        isPublished: true 
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching quizzes by difficulty: ' + error.message);
    }
  }

  // Get quiz by category
  async getQuizzesByCategory(category, semester) {
    try {
      return await Quiz.find({ 
        category, 
        semester,
        isPublished: true 
      }).sort({ startDate: 1 });
    } catch (error) {
      throw new Error('Error fetching quizzes by category: ' + error.message);
    }
  }
}

module.exports = new QuizService();