const quizService = require('../services/quizService');

// Controller methods for Quiz
const quizController = {
    // Get all quizzes
    getAllQuizzes: async (req, res) => {
        try {
            const quizzes = await quizService.getAllQuizzes();
            res.json(quizzes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get quiz by ID
    getQuizById: async (req, res) => {
        try {
            const quiz = await quizService.getQuizById(req.params.id);
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }
            res.json(quiz);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new quiz
    createQuiz: async (req, res) => {
        try {
            const quiz = await quizService.createQuiz(req.body);
            res.status(201).json(quiz);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update quiz
    updateQuiz: async (req, res) => {
        try {
            const quiz = await quizService.updateQuiz(req.params.id, req.body);
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }
            res.json(quiz);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete quiz
    deleteQuiz: async (req, res) => {
        try {
            const quiz = await quizService.deleteQuiz(req.params.id);
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }
            res.json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Submit quiz attempt
    submitQuiz: async (req, res) => {
        try {
            const result = await quizService.submitQuiz(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = quizController;