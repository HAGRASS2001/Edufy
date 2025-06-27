export interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: string;
  instructor: string;
  semester: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  studentMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'assignment' | 'practice' | 'midterm' | 'final';
  startDate: string;
  endDate: string;
  tags: string[];
  assignedStudents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  course: string;
  instructor: string;
  semester: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  studentMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'assignment' | 'practice' | 'midterm' | 'final';
  startDate: string;
  endDate: string;
  tags: string[];
  assignedStudents?: string[];
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {
  studentMarks?: number;
  assignedStudents?: string[];
}

export interface QuizFilters {
  difficulty?: string;
  category?: string;
  course?: string;
  semester?: string;
  instructor?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
} 