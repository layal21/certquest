import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Topic, UserProgress } from '@/types';
import { Link } from 'wouter';
import { Check, Play, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  progress?: UserProgress;
  questionCount?: number;
}

export function TopicCard({ topic, progress, questionCount = 10 }: TopicCardProps) {
  const isCompleted = progress?.isCompleted || false;
  const isInProgress = progress && progress.completedQuestions > 0 && !progress.isCompleted;
  const isNotStarted = !progress || progress.completedQuestions === 0;
  
  const progressPercentage = progress 
    ? Math.round((progress.completedQuestions / Math.max(progress.totalQuestions, questionCount)) * 100)
    : 0;

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        icon: <Check className="text-success" />,
        iconBg: "bg-success/10",
        status: "Completed",
        statusColor: "text-success",
        actionText: "Review",
        actionVariant: "outline" as const,
      };
    } else if (isInProgress) {
      return {
        icon: <Play className="text-warning" />,
        iconBg: "bg-warning/10",
        status: "In Progress",
        statusColor: "text-warning",
        actionText: "Continue",
        actionVariant: "default" as const,
      };
    } else {
      return {
        icon: <Server className="text-muted-foreground" />,
        iconBg: "bg-muted",
        status: "Not Started",
        statusColor: "text-muted-foreground",
        actionText: "Start",
        actionVariant: "default" as const,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card 
      className="p-6 hover:shadow-md transition-all duration-200" 
      data-testid={`topic-card-${topic.id}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", statusInfo.iconBg)}>
              {statusInfo.icon}
            </div>
            <div>
              <h4 className="font-medium text-foreground" data-testid="text-topic-name">{topic.name}</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-question-count">
                {questionCount} questions
              </p>
            </div>
          </div>
          <span className={cn("text-sm font-medium", statusInfo.statusColor)} data-testid="text-topic-status">
            {statusInfo.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {isCompleted && progress ? `Score: ${progress.bestScore}%` : 
               isInProgress && progress ? `Question ${progress.completedQuestions}/${questionCount}` :
               `0/${questionCount} completed`}
            </span>
            <Button 
              variant={statusInfo.actionVariant}
              size="sm" 
              asChild 
              data-testid="button-topic-action"
            >
              <Link href={`/quiz/${topic.id}`}>{statusInfo.actionText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
