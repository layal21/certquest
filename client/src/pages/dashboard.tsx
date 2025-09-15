import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CertificationCard } from '@/components/dashboard/certification-card';
import { TopicCard } from '@/components/dashboard/topic-card';
import { useAuth } from '@/hooks/use-auth';
import { useProgress, useCertifications, useTopics } from '@/hooks/use-progress';
import { Certification, Topic } from '@/types';
import { Link } from 'wouter';
import { BookOpen, Trophy, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  
  const { data: certifications = [], isLoading: certificationsLoading } = useCertifications();
  const { data: awsTopics = [], isLoading: topicsLoading } = useTopics('aws-cloud-practitioner');
  const { data: progress = [], isLoading: progressLoading } = useProgress('aws-cloud-practitioner');

  // Mock data for additional certifications (coming soon)
  const mockCertifications: Certification[] = [
    {
      id: 'aws-solutions-architect',
      name: 'AWS Solutions Architect',
      description: 'Associate Level',
      level: 'Associate',
      provider: 'aws',
      isActive: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'aws-developer',
      name: 'AWS Developer',
      description: 'Associate Level', 
      level: 'Associate',
      provider: 'aws',
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ];

  // Mock topics with question counts from PRD
  const topicQuestionCounts: Record<string, number> = {
    'global-infrastructure': 10,
    'iam': 10,
    'ec2': 10,
    'storage': 10,
    's3': 12,
    'pricing-billing': 15,
    'support': 8,
    'security-compliance': 14,
    'databases': 11,
  };

  if (certificationsLoading || topicsLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center" data-testid="dashboard-header">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Your Certification Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your progress across multiple certifications and continue where you left off
          </p>
        </div>

        {/* Quick Stats */}
        {isAuthenticated && progress.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" data-testid="quick-stats">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-warning" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {progress.filter(p => p.isCompleted).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Topics</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-success" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(progress.reduce((sum, p) => sum + p.bestScore, 0) / Math.max(progress.length, 1))}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {progress.reduce((sum, p) => sum + p.completedQuestions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Math.floor(progress.reduce((sum, p) => sum + p.timeSpent, 0) / 3600)}h
              </div>
              <div className="text-sm text-muted-foreground">Time Studied</div>
            </Card>
          </div>
        )}

        {/* Certification Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16" data-testid="certification-cards">
          {/* AWS Cloud Practitioner - Active */}
          {certifications.length > 0 ? (
            <CertificationCard 
              certification={certifications[0]} 
              progress={progress}
              isActive={true}
            />
          ) : (
            <CertificationCard 
              certification={{
                id: 'aws-cloud-practitioner',
                name: 'AWS Cloud Practitioner',
                description: 'Foundational Level',
                level: 'Foundational',
                provider: 'aws',
                isActive: true,
                createdAt: new Date().toISOString(),
              }}
              progress={progress}
              isActive={true}
            />
          )}
          
          {/* Coming Soon Certifications */}
          {mockCertifications.map((cert) => (
            <CertificationCard 
              key={cert.id}
              certification={cert} 
              progress={[]}
              isActive={false}
            />
          ))}
        </div>

        {/* Topic Breakdown */}
        <div data-testid="topic-breakdown">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">AWS Cloud Practitioner Topics</h2>
            {!isAuthenticated && (
              <Button asChild data-testid="button-login-to-track">
                <Link href="/auth">Login to Track Progress</Link>
              </Button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="topic-cards">
            {awsTopics.length > 0 ? (
              awsTopics.map((topic: Topic) => {
                const topicProgress = progress.find(p => p.topicId === topic.id);
                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    progress={topicProgress}
                    questionCount={topicQuestionCounts[topic.id] || 10}
                  />
                );
              })
            ) : (
              // Fallback topics from PRD if API fails
              [
                { id: 'global-infrastructure', name: 'AWS Global Infrastructure', description: 'Understanding AWS Regions, Availability Zones, and Edge Locations' },
                { id: 'iam', name: 'Identity and Access Management (IAM)', description: 'Managing users, groups, roles, and permissions in AWS' },
                { id: 'ec2', name: 'Amazon EC2 (Elastic Compute Cloud)', description: 'Virtual servers and compute resources in the cloud' },
                { id: 'storage', name: 'AWS Storage Services', description: 'Overview of AWS storage options including EBS, EFS, and storage gateways' },
                { id: 's3', name: 'Amazon S3', description: 'Object storage for the internet, backup, and archiving' },
                { id: 'pricing-billing', name: 'AWS Pricing and Billing', description: 'Cost management, pricing models, and billing concepts' },
                { id: 'support', name: 'AWS Support', description: 'Support plans, resources, and best practices' },
                { id: 'security-compliance', name: 'Security and Compliance', description: 'AWS security features, compliance programs, and shared responsibility model' },
                { id: 'databases', name: 'AWS Database Services', description: 'Overview of AWS database offerings and use cases' },
              ].map((topic, index) => {
                const topicProgress = progress.find(p => p.topicId === topic.id);
                return (
                  <TopicCard
                    key={topic.id}
                    topic={{
                      ...topic,
                      certificationId: 'aws-cloud-practitioner',
                      orderIndex: index,
                      isActive: true,
                    }}
                    progress={topicProgress}
                    questionCount={topicQuestionCounts[topic.id] || 10}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-16 text-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-12" data-testid="auth-cta">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Learning?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your free account to track your progress, save your quiz results, and get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-cta-signup">
                <Link href="/auth">Create Free Account</Link>
              </Button>
              <Button variant="outline" size="lg" asChild data-testid="button-cta-signin">
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
