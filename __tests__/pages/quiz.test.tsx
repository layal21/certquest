import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth-context';
import { QuizProvider } from '@/context/quiz-context';
import Quiz from '@/pages/quiz';

// Mock wouter
const mockUseParams = jest.fn();
const mockSetLocation = jest.fn();
jest.mock('wouter', () => ({
  useParams: () => mockUseParams(),
  useLocation: () => ['/quiz/global-infrastructure', mockSetLocation],
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock auth context
const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: true,
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock quiz context
const mockQuizContext = {
  state: {
    questions: [
      {
        id: '1',
        question: 'What is AWS?',
        options: ['Cloud platform', 'Database', 'Operating system', 'Programming language'],
        topicId: 'global-infrastructure',
        isActive: true,
        createdAt: '2024-01-01',
        correctAnswer: 0,
        explanation: 'AWS is a cloud platform.',
      },
    ],
    currentQuestionIndex: 0,
    answers: {},
    session: {
      id: 'session-1',
      userId: '1',
      topicId: 'global-infrastructure',
      currentQuestionIndex: 0,
      answers: {},
      startedAt: '2024-01-01',
      isActive: true,
    },
    isLoading: false,
    showExplanation: false,
    timeSpent: 0,
  },
  startQuiz: jest.fn(),
  submitAnswer: jest.fn(),
  completeQuiz: jest.fn(),
  resetQuiz: jest.fn(),
  goToQuestion: jest.fn(),
  resumeQuiz: jest.fn(),
};

jest.mock('@/hooks/use-quiz', () => ({
  useQuiz: () => mockQuizContext,
}));

describe('Quiz', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ topicId: 'global-infrastructure' });
  });

  const renderQuiz = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <QuizProvider>
            <Quiz />
          </QuizProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders quiz page with question', () => {
    renderQuiz();
    
    expect(screen.getByTestId('quiz-page')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-title')).toHaveTextContent('AWS Global Infrastructure');
    expect(screen.getByTestId('question-text')).toHaveTextContent('What is AWS?');
  });

  it('displays progress information', () => {
    renderQuiz();
    
    expect(screen.getByTestId('quiz-progress-text')).toHaveTextContent('Question 1 of 1');
    expect(screen.getByTestId('quiz-progress-bar')).toBeInTheDocument();
  });

  it('displays answer options', () => {
    renderQuiz();
    
    expect(screen.getByTestId('answer-options')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-option-0')).toHaveTextContent('Cloud platform');
    expect(screen.getByTestId('quiz-option-1')).toHaveTextContent('Database');
    expect(screen.getByTestId('quiz-option-2')).toHaveTextContent('Operating system');
    expect(screen.getByTestId('quiz-option-3')).toHaveTextContent('Programming language');
  });

  it('allows selecting an answer', () => {
    renderQuiz();
    
    const firstOption = screen.getByTestId('quiz-option-0');
    fireEvent.click(firstOption);
    
    expect(firstOption).toHaveClass('border-primary', 'bg-primary/5');
  });

  it('shows submit button when answer is selected', () => {
    renderQuiz();
    
    const submitButton = screen.getByTestId('button-submit-answer');
    expect(submitButton).toBeDisabled();
    
    const firstOption = screen.getByTestId('quiz-option-0');
    fireEvent.click(firstOption);
    
    expect(submitButton).not.toBeDisabled();
  });

  it('submits answer when submit button is clicked', async () => {
    renderQuiz();
    
    const firstOption = screen.getByTestId('quiz-option-0');
    fireEvent.click(firstOption);
    
    const submitButton = screen.getByTestId('button-submit-answer');
    fireEvent.click(submitButton);
    
    expect(mockQuizContext.submitAnswer).toHaveBeenCalledWith('1', 0, expect.any(Number));
  });

  it('shows explanation after answer is submitted', () => {
    mockQuizContext.state.showExplanation = true;
    renderQuiz();
    
    expect(screen.getByTestId('question-explanation')).toBeInTheDocument();
    expect(screen.getByText('AWS is a cloud platform.')).toBeInTheDocument();
  });

  it('enables navigation buttons appropriately', () => {
    renderQuiz();
    
    const previousButton = screen.getByTestId('button-previous');
    const nextButton = screen.getByTestId('button-next');
    
    expect(previousButton).toBeDisabled(); // First question
    expect(nextButton).toBeDisabled(); // No explanation shown yet
  });

  it('shows question navigation dots', () => {
    renderQuiz();
    
    expect(screen.getByTestId('question-dots')).toBeInTheDocument();
    expect(screen.getByTestId('question-dot-0')).toBeInTheDocument();
  });

  it('redirects to auth if not authenticated', () => {
    mockAuthContext.isAuthenticated = false;
    renderQuiz();
    
    expect(mockSetLocation).toHaveBeenCalledWith('/auth');
  });

  it('starts quiz when topic is loaded', () => {
    mockQuizContext.state.questions = [];
    renderQuiz();
    
    expect(mockQuizContext.startQuiz).toHaveBeenCalledWith('global-infrastructure');
  });

  it('shows loading state', () => {
    mockQuizContext.state.isLoading = true;
    renderQuiz();
    
    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('handles question navigation', () => {
    renderQuiz();
    
    const questionDot = screen.getByTestId('question-dot-0');
    fireEvent.click(questionDot);
    
    expect(mockQuizContext.goToQuestion).toHaveBeenCalledWith(0);
  });
});
