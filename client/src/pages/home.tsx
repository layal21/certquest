import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, Users, Award, BookOpen, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 slide-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="hero-title">
                  Master Your{' '}
                  <span className="text-primary">AWS Certifications</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="hero-description">
                  Prepare for success with interactive quizzes, detailed explanations, and progress tracking. Start your cloud certification journey today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-start-learning">
                  <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="flex items-center space-x-2">
                    <span>Start Learning</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild data-testid="button-view-certifications">
                  <Link href="/dashboard">View All Certifications</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                <div className="text-center" data-testid="stat-questions">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Practice Questions</div>
                </div>
                <div className="text-center" data-testid="stat-success-rate">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center" data-testid="stat-students">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Professional studying for certifications" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="hero-image"
              />
              
              {/* Floating UI Elements */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg fade-in" data-testid="floating-quiz-completed">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Quiz Completed</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg fade-in" style={{animationDelay: '0.2s'}} data-testid="floating-progress">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Progress</div>
                    <div className="text-xs text-muted-foreground">85% Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="features-title">
              Why Choose CertPrep?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-description">
              Our comprehensive platform provides everything you need to succeed in your certification journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-md transition-shadow" data-testid="feature-interactive">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Interactive Learning</h3>
              <p className="text-muted-foreground">
                Engage with hands-on quizzes and receive immediate feedback to reinforce your understanding.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-md transition-shadow" data-testid="feature-progress">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your advancement across topics and certifications with detailed analytics.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-md transition-shadow" data-testid="feature-expert">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Content</h3>
              <p className="text-muted-foreground">
                Learn from industry professionals with real-world experience and proven results.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="testimonials-title">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="testimonials-description">
              Join thousands of professionals who have advanced their careers with CertPrep
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6" data-testid={`testimonial-${i}`}>
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "CertPrep made all the difference in my AWS certification journey. The interactive quizzes and detailed explanations helped me understand complex concepts."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">AWS Professional</div>
                    <div className="text-sm text-muted-foreground">Cloud Architect</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="cta-title">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="cta-description">
            Join thousands of professionals who have successfully passed their AWS certifications with CertPrep
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-cta-primary">
              <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="flex items-center space-x-2">
                <span>Get Started Free</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild data-testid="button-cta-secondary">
              <Link href="/dashboard">Explore Certifications</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
