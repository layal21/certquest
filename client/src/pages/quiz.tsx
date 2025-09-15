import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizOption } from '@/components/ui/quiz-option';
import { useQuiz } from '@/hooks/use-quiz';
import { useAuth } from '@/hooks/use-auth';
import { Question } from '@/types';
import { X, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function Quiz() {
  const { topicId } = useParams<{ topicId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { state, startQuiz, submitAnswer, goToQuestion } = useQuiz();
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }

    if (topicId && state.questions.length === 0) {
      startQuiz(topicId);
    }
  }, [topicId, isAuthenticated, state.questions.length, startQuiz, setLocation]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
  }, [state.currentQuestionIndex]);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = state.questions.length > 0 
    ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100 
    : 0;

  const handleAnswerSelect = (answerIndex: number) => {
    if (state.showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    await submitAnswer(currentQuestion.id, selectedAnswer, timeSpent);
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      goToQuestion(state.currentQuestionIndex + 1);
    } else {
      // Quiz completed, redirect to results
      setLocation(`/quiz/${topicId}/results`);
    }
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      goToQuestion(state.currentQuestionIndex - 1);
    }
  };

  const getTopicName = (topicId: string): string => {
    const topicNames: Record<string, string> = {
      'global-infrastructure': 'AWS Global Infrastructure',
      'iam': 'Identity and Access Management (IAM)',
      'ec2': 'Amazon EC2 (Elastic Compute Cloud)',
      'storage': 'AWS Storage Services',
      's3': 'Amazon S3',
      'pricing-billing': 'AWS Pricing and Billing',
      'support': 'AWS Support',
      'security-compliance': 'Security and Compliance',
      'databases': 'AWS Database Services',
    };
    return topicNames[topicId] || 'Unknown Topic';
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground mb-4">Quiz not found or failed to load.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8" data-testid="quiz-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-sm p-8" data-testid="quiz-card">
          {/* Quiz Header */}
          <div className="mb-8" data-testid="quiz-header">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="quiz-title">
                  {getTopicName(topicId!)}
                </h1>
                <p className="text-muted-foreground" data-testid="quiz-progress-text">
                  Question {state.currentQuestionIndex + 1} of {state.questions.length}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                data-testid="button-close-quiz"
              >
                <Link href="/dashboard">
                  <X className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Progress Bar */}
            <Progress value={progress} className="h-2" data-testid="quiz-progress-bar" />
          </div>

          {/* Question */}
          <div className="mb-8" data-testid="question-section">
            <h2 className="text-xl font-semibold text-foreground mb-6 leading-relaxed" data-testid="question-text">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3" data-testid="answer-options">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = state.showExplanation && currentQuestion.correctAnswer === index;
                const isUserAnswer = state.showExplanation && selectedAnswer === index;

                return (
                  <QuizOption
                    key={index}
                    option={option}
                    index={index}
                    selected={isSelected}
                    showResult={state.showExplanation}
                    isCorrect={isCorrect}
                    isUserAnswer={isUserAnswer}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={state.showExplanation}
                  />
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {state.showExplanation && currentQuestion.explanation && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-6 mb-8 fade-in" data-testid="question-explanation">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-success mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Answer Button */}
          {!state.showExplanation && (
            <div className="mb-8">
              <Button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full sm:w-auto"
                data-testid="button-submit-answer"
              >
                Submit Answer
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center" data-testid="quiz-navigation">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={state.currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {/* Question Navigation Dots */}
            <div className="flex space-x-2" data-testid="question-dots">
              {state.questions.map((_, index) => {
                const isCompleted = state.answers[state.questions[index]?.id] !== undefined;
                const isCurrent = index === state.currentQuestionIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-success text-white'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                    data-testid={`question-dot-${index}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={!state.showExplanation}
              data-testid="button-next"
            >
              {state.currentQuestionIndex === state.questions.length - 1 ? 'Finish Quiz' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Quiz Info */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>No time limit</span>
              </div>
              <div>
                Questions answered: {Object.keys(state.answers).length}/{state.questions.length}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
