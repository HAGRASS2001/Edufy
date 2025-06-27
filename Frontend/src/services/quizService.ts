import api from './api';
import { 
  Quiz, 
  CreateQuizRequest, 
  UpdateQuizRequest, 
  QuizFilters 
} from '../types/quiz';

export const quizService = {
  // Get all quizzes (no filters)
  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return Array.isArray(response.data) ? response.data : response.data.quizzes;
  },

  // Get single quiz by ID
  getQuiz: async (id: string) => {
    const response = await api.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (data: CreateQuizRequest) => {
    const response = await api.post<Quiz>('/quizzes', data);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (id: string, data: UpdateQuizRequest) => {
    const response = await api.put<Quiz>(`/quizzes/${id}`, data);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  // Get quizzes assigned to a student (filtered by assignedStudents)
  getStudentQuizzes: async (studentId: string) => {
    const response = await api.get(`/quizzes?assignedStudent=${studentId}`);
    return response.data;
  },
}; 