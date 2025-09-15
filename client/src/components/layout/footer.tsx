import { Link } from 'wouter';
import { GraduationCap } from 'lucide-react';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-card border-t" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CertPrep</span>
            </div>
            <p className="text-muted-foreground text-sm">
              The ultimate platform for AWS certification preparation with interactive quizzes 
              and comprehensive progress tracking.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Certifications</h4>
            <div className="space-y-2">
              <Link 
                href="/dashboard" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-cloud-practitioner"
              >
                AWS Cloud Practitioner
              </Link>
              <span className="block text-muted-foreground text-sm">AWS Solutions Architect (Coming Soon)</span>
              <span className="block text-muted-foreground text-sm">AWS Developer (Coming Soon)</span>
              <span className="block text-muted-foreground text-sm">AWS SysOps (Coming Soon)</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="space-y-2">
              <Link 
                href="/dashboard" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-study-guides"
              >
                Study Guides
              </Link>
              <Link 
                href="/dashboard" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-practice-tests"
              >
                Practice Tests
              </Link>
              <Link 
                href="/dashboard" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-progress-tracking"
              >
                Progress Tracking
              </Link>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-community"
              >
                Community
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2">
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-help"
              >
                Help Center
              </a>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-contact"
              >
                Contact Us
              </a>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-privacy"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid="link-footer-terms"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm" data-testid="text-copyright">
            &copy; 2024 CertPrep. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-social-twitter"
              aria-label="Twitter"
            >
              <FaTwitter className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-social-linkedin"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-social-github"
              aria-label="GitHub"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
