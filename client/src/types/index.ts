export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Certification {
  id: string;
  name: string;
  description?: string;
  level?: string;
  provider?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Topic {
  id: string;
  certificationId: string;
  name: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctAnswer?: number; // Hidden during quiz
  explanation?: string; // Shown after answer
  difficulty?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  certificationId: string;
  topicId: string;
  totalQuestions: number;
  completedQuestions: number;
  correctAnswers: number;
  bestScore: number;
  lastQuestionIndex: number;
  isCompleted: boolean;
  timeSpent: number;
  updatedAt: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  topicId: string;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  startedAt: string;
  completedAt?: string;
  score?: number;
  isActive: boolean;
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, number>;
  session: QuizSession | null;
  isLoading: boolean;
  showExplanation: boolean;
  timeSpent: number;
}

export interface QuizResults {
  session: QuizSession;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: UserAnswer[];
}

export interface ApiError {
  message: string;
  code: string;
  errors?: any[];
}
