import { createContext, useContext, useReducer, useEffect } from 'react';
import { Question, QuizSession, UserAnswer, QuizState, QuizResults } from '@/types';
import { getAuthHeaders, addCSRFToken } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface QuizContextType {
  state: QuizState;
  startQuiz: (topicId: string) => Promise<boolean>;
  submitAnswer: (questionId: string, selectedAnswer: number, timeSpent: number) => Promise<boolean>;
  completeQuiz: () => Promise<QuizResults | null>;
  resetQuiz: () => void;
  goToQuestion: (index: number) => void;
  resumeQuiz: (session: QuizSession) => void;
}

type QuizAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_SESSION'; payload: QuizSession }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'SET_ANSWER'; payload: { questionId: string; answer: number } }
  | { type: 'SHOW_EXPLANATION'; payload: boolean }
  | { type: 'SET_TIME_SPENT'; payload: number }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  session: null,
  isLoading: false,
  showExplanation: false,
  timeSpent: 0,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestionIndex: action.payload, showExplanation: false };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
      };
    case 'SHOW_EXPLANATION':
      return { ...state, showExplanation: action.payload };
    case 'SET_TIME_SPENT':
      return { ...state, timeSpent: action.payload };
    case 'RESET_QUIZ':
      return initialState;
    default:
      return state;
  }
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { toast } = useToast();

  const startQuiz = async (topicId: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Get questions first
      const questionsResponse = await fetch(`/api/topics/${topicId}/questions`, {
        headers: getAuthHeaders(),
      });

      if (!questionsResponse.ok) {
        throw new Error('Failed to load questions');
      }

      const questions = await questionsResponse.json();
      dispatch({ type: 'SET_QUESTIONS', payload: questions });

      // Start quiz session
      const headers = await addCSRFToken({
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      });

      const sessionResponse = await fetch('/api/quiz/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ topicId }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to start quiz session');
      }

      const sessionData = await sessionResponse.json();
      dispatch({ type: 'SET_SESSION', payload: sessionData.session });

      // Resume from existing progress if session exists
      if (sessionData.session.currentQuestionIndex > 0) {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: sessionData.session.currentQuestionIndex });
        // Restore answers from session
        Object.entries(sessionData.session.answers).forEach(([questionId, answer]) => {
          dispatch({ type: 'SET_ANSWER', payload: { questionId, answer: answer as number } });
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast({
        title: "Quiz failed to start",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitAnswer = async (questionId: string, selectedAnswer: number, timeSpent: number): Promise<boolean> => {
    if (!state.session) return false;

    try {
      const headers = await addCSRFToken({
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      });

      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          questionId,
          sessionId: state.session.id,
          selectedAnswer,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      
      // Update local state
      dispatch({ type: 'SET_ANSWER', payload: { questionId, answer: selectedAnswer } });
      dispatch({ type: 'SET_SESSION', payload: result.session });
      dispatch({ type: 'SHOW_EXPLANATION', payload: true });

      return true;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast({
        title: "Failed to submit answer",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const completeQuiz = async (): Promise<QuizResults | null> => {
    if (!state.session) return null;

    try {
      const headers = await addCSRFToken({
        ...getAuthHeaders(),
      });

      const response = await fetch(`/api/quiz/${state.session.id}/complete`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to complete quiz');
      }

      const results = await response.json();
      
      toast({
        title: "Quiz completed!",
        description: `You scored ${results.score}% (${results.correctCount}/${results.totalQuestions})`,
      });

      return results;
    } catch (error) {
      console.error('Failed to complete quiz:', error);
      toast({
        title: "Failed to complete quiz",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < state.questions.length) {
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: index });
    }
  };

  const resumeQuiz = (session: QuizSession) => {
    dispatch({ type: 'SET_SESSION', payload: session });
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: session.currentQuestionIndex });
    
    // Restore answers
    Object.entries(session.answers).forEach(([questionId, answer]) => {
      dispatch({ type: 'SET_ANSWER', payload: { questionId, answer: answer as number } });
    });
  };

  const value: QuizContextType = {
    state,
    startQuiz,
    submitAnswer,
    completeQuiz,
    resetQuiz,
    goToQuestion,
    resumeQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
