import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Certification, UserProgress } from '@/types';
import { Link } from 'wouter';
import { ChevronDown, Lock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CertificationCardProps {
  certification: Certification;
  progress?: UserProgress[];
  isActive?: boolean;
}

export function CertificationCard({ certification, progress = [], isActive = true }: CertificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTopics = progress.filter(p => p.isCompleted).length;
  const totalTopics = Math.max(progress.length, 9); // Default to 9 topics for AWS Cloud Practitioner
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  
  const averageScore = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.bestScore, 0) / progress.length)
    : 0;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
  const timeString = formatTime(totalTimeSpent);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  if (!isActive) {
    return (
      <Card className="p-6 opacity-75" data-testid={`cert-card-${certification.id}`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              certification.id === 'aws-solutions-architect' && "bg-gradient-to-br from-blue-400 to-blue-600",
              certification.id === 'aws-developer' && "bg-gradient-to-br from-purple-400 to-purple-600",
              certification.id.includes('aws') && "bg-gradient-to-br from-orange-400 to-orange-600"
            )}>
              <i className="fab fa-aws text-white text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{certification.name}</h3>
              <p className="text-sm text-muted-foreground">{certification.level} Level</p>
            </div>
          </div>
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Coming Soon</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-all duration-200 fade-in" data-testid={`cert-card-${certification.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <i className="fab fa-aws text-white text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid="text-cert-name">{certification.name}</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-cert-level">{certification.level} Level</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-expand-cert"
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-center">
          <ProgressCircle progress={overallProgress} />
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Completed Topics</span>
            <span className="font-medium text-foreground" data-testid="text-completed-topics">
              {completedTopics}/{totalTopics}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Average Score</span>
            <span className="font-medium text-foreground" data-testid="text-average-score">
              {averageScore}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Time Spent</span>
            <span className="font-medium text-foreground" data-testid="text-time-spent">
              {timeString}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" asChild data-testid="button-continue-learning">
            <Link href="/dashboard">Continue Learning</Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-view-topics"
          >
            View All Topics
          </Button>
        </div>

        {/* Expanded Content - Topic Breakdown would go here */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-border" data-testid="expanded-content">
            <p className="text-sm text-muted-foreground">
              Topic breakdown and detailed progress would be displayed here.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
