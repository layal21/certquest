import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/hooks/use-quiz';
import { useAuth } from '@/hooks/use-auth';
import { QuizResults as QuizResultsType } from '@/types';
import { Trophy, RotateCcw, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function QuizResults() {
  const { topicId } = useParams<{ topicId: string }>();
  const { isAuthenticated } = useAuth();
  const { state, completeQuiz, resetQuiz } = useQuiz();
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated) return;
      
      if (state.session && !state.session.completedAt) {
        const quizResults = await completeQuiz();
        if (quizResults) {
          setResults(quizResults);
        }
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [state.session, completeQuiz, isAuthenticated]);

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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Outstanding! You\'re well-prepared for the certification.';
    if (score >= 80) return 'Great job! You have a solid understanding of the topic.';
    if (score >= 70) return 'Good work! A little more study and you\'ll be ready.';
    if (score >= 60) return 'Keep practicing! Review the topics you missed.';
    return 'More study needed. Focus on understanding the key concepts.';
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view quiz results.</p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground mb-4">No quiz results found.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const totalTime = results.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);

  return (
    <div className="min-h-screen bg-muted/30 py-8" data-testid="quiz-results-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-sm p-8 text-center" data-testid="results-card">
          {/* Results Header */}
          <div className="mb-8" data-testid="results-header">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              results.score >= 80 ? 'bg-success/10' : results.score >= 60 ? 'bg-warning/10' : 'bg-destructive/10'
            }`}>
              <Trophy className={`h-10 w-10 ${getScoreColor(results.score)}`} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="results-title">
              Quiz Complete!
            </h1>
            <p className="text-muted-foreground" data-testid="topic-name">
              {getTopicName(topicId!)}
            </p>
          </div>

          {/* Score Display */}
          <div className="mb-8" data-testid="score-display">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.score)}`} data-testid="score-percentage">
              {results.score}%
            </div>
            <p className="text-xl text-muted-foreground mb-4" data-testid="score-label">Your Score</p>
            <p className="text-muted-foreground mb-2" data-testid="score-fraction">
              You answered {results.correctCount} out of {results.totalQuestions} questions correctly
            </p>
            <p className={`text-sm ${getScoreColor(results.score)}`} data-testid="score-message">
              {getScoreMessage(results.score)}
            </p>
          </div>

          {/* Performance Breakdown */}
          <div className="grid md:grid-cols-3 gap-6 mb-8" data-testid="performance-breakdown">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="text-2xl font-bold text-success mb-1" data-testid="correct-count">
                {results.correctCount}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </Card>
            
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive mb-1" data-testid="incorrect-count">
                {results.totalQuestions - results.correctCount}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </Card>
            
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1" data-testid="time-taken">
                {formatTime(totalTime)}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8" data-testid="action-buttons">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              data-testid="button-review-answers"
            >
              <span>Review Answers</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRetakeQuiz}
              className="flex items-center space-x-2"
              data-testid="button-retake-quiz"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </Button>
            <Button asChild data-testid="button-next-topic">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span>Back to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Performance Insights */}
          <div className="pt-8 border-t border-border" data-testid="performance-insights">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Insights</h3>
            <div className="text-left space-y-3 max-w-2xl mx-auto">
              {results.score >= 80 ? (
                <div className="flex items-start space-x-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-success">Excellent Performance</p>
                    <p className="text-muted-foreground">
                      You demonstrate strong understanding of this topic. You're ready to move on to advanced concepts.
                    </p>
                  </div>
                </div>
              ) : results.score >= 60 ? (
                <div className="flex items-start space-x-3 text-sm">
                  <Trophy className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Good Progress</p>
                    <p className="text-muted-foreground">
                      You have a solid foundation. Review the questions you missed and try again to improve your score.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 text-sm">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Needs Improvement</p>
                    <p className="text-muted-foreground">
                      Focus on understanding the key concepts. Consider reviewing the study materials before retaking.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
