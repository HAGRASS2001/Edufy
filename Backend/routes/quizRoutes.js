const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get quiz by ID
router.get('/:id', quizController.getQuizById);

// Create new quiz
router.post('/', quizController.createQuiz);

// Update quiz
router.put('/:id', quizController.updateQuiz);

// Delete quiz
router.delete('/:id', quizController.deleteQuiz);

// Submit quiz attempt
router.post('/:id/submit', quizController.submitQuiz);

module.exports = router;