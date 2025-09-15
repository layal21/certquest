import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { authService } from "./services/supabase";
import { authenticateToken, optionalAuth, type AuthenticatedRequest } from "./middleware/auth";
import { 
  helmetConfig, 
  authLimiter, 
  generalLimiter, 
  quizLimiter, 
  sanitizeInput, 
  csrfProtection, 
  generateCSRFToken 
} from "./middleware/security";
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  registerSchema, 
  loginSchema, 
  submitAnswerSchema, 
  startQuizSchema,
  updateProgressSchema 
} from "./middleware/validation";
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(helmetConfig);
  app.use(sanitizeInput);
  app.use(generalLimiter);

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // CSRF token endpoint
  app.get('/api/csrf-token', generateCSRFToken);

  // Authentication routes
  app.post('/api/auth/register', 
    authLimiter,
    validateBody(registerSchema),
    csrfProtection,
    async (req, res) => {
      try {
        const { email, password, firstName, lastName } = req.body;
        const result = await authService.register(email, password, firstName, lastName);
        
        if (result.error) {
          return res.status(400).json({ 
            message: result.error,
            code: 'REGISTRATION_FAILED'
          });
        }

        res.status(201).json({
          user: {
            id: result.user!.id,
            email: result.user!.email,
            firstName: result.user!.firstName,
            lastName: result.user!.lastName,
            isEmailVerified: result.user!.isEmailVerified
          },
          token: result.token
        });
      } catch (error) {
        console.error('Registration route error:', error);
        res.status(500).json({ 
          message: 'Registration failed',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.post('/api/auth/login',
    authLimiter,
    validateBody(loginSchema),
    csrfProtection,
    async (req, res) => {
      try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        
        if (result.error) {
          return res.status(401).json({ 
            message: result.error,
            code: 'LOGIN_FAILED'
          });
        }

        res.json({
          user: {
            id: result.user!.id,
            email: result.user!.email,
            firstName: result.user!.firstName,
            lastName: result.user!.lastName,
            isEmailVerified: result.user!.isEmailVerified
          },
          token: result.token
        });
      } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({ 
          message: 'Login failed',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.post('/api/auth/verify-email',
    validateBody(z.object({ token: z.string() })),
    async (req, res) => {
      try {
        const { token } = req.body;
        const result = await authService.verifyEmail(token);
        
        if (!result.success) {
          return res.status(400).json({ 
            message: result.error,
            code: 'VERIFICATION_FAILED'
          });
        }

        res.json({ message: 'Email verified successfully' });
      } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ 
          message: 'Email verification failed',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.post('/api/auth/reset-password',
    authLimiter,
    validateBody(z.object({ email: z.string().email() })),
    async (req, res) => {
      try {
        const { email } = req.body;
        const result = await authService.resetPassword(email);
        
        // Always return success to prevent email enumeration
        res.json({ message: 'Password reset email sent if account exists' });
      } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
          message: 'Password reset failed',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  // User routes
  app.get('/api/user/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Failed to get user profile',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Certification routes
  app.get('/api/certifications', optionalAuth, async (req, res) => {
    try {
      const certifications = await storage.getCertifications();
      res.json(certifications);
    } catch (error) {
      console.error('Get certifications error:', error);
      res.status(500).json({ 
        message: 'Failed to get certifications',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  app.get('/api/certifications/:id', 
    validateParams(z.object({ id: z.string() })),
    optionalAuth,
    async (req, res) => {
      try {
        const certification = await storage.getCertification(req.params.id);
        if (!certification) {
          return res.status(404).json({ 
            message: 'Certification not found',
            code: 'CERTIFICATION_NOT_FOUND'
          });
        }
        res.json(certification);
      } catch (error) {
        console.error('Get certification error:', error);
        res.status(500).json({ 
          message: 'Failed to get certification',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  // Topic routes
  app.get('/api/certifications/:certificationId/topics',
    validateParams(z.object({ certificationId: z.string() })),
    optionalAuth,
    async (req, res) => {
      try {
        const topics = await storage.getTopicsByCertification(req.params.certificationId);
        res.json(topics);
      } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ 
          message: 'Failed to get topics',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.get('/api/topics/:id',
    validateParams(z.object({ id: z.string() })),
    optionalAuth,
    async (req, res) => {
      try {
        const topic = await storage.getTopic(req.params.id);
        if (!topic) {
          return res.status(404).json({ 
            message: 'Topic not found',
            code: 'TOPIC_NOT_FOUND'
          });
        }
        res.json(topic);
      } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ 
          message: 'Failed to get topic',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  // Question routes
  app.get('/api/topics/:topicId/questions',
    validateParams(z.object({ topicId: z.string() })),
    optionalAuth,
    async (req, res) => {
      try {
        const questions = await storage.getQuestionsByTopic(req.params.topicId);
        // Remove correct answers and explanations for unauthenticated users taking quiz
        const sanitizedQuestions = questions.map(q => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined
        }));
        res.json(sanitizedQuestions);
      } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ 
          message: 'Failed to get questions',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  // Quiz routes
  app.post('/api/quiz/start',
    quizLimiter,
    authenticateToken,
    validateBody(startQuizSchema),
    csrfProtection,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { topicId } = req.body;
        
        // Check for existing active session
        const existingSession = await storage.getActiveQuizSession(req.user!.id, topicId);
        if (existingSession) {
          return res.json({ session: existingSession });
        }

        // Create new session
        const session = await storage.createQuizSession({
          userId: req.user!.id,
          topicId,
          currentQuestionIndex: 0,
          answers: {}
        });

        res.status(201).json({ session });
      } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ 
          message: 'Failed to start quiz',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.post('/api/quiz/answer',
    quizLimiter,
    authenticateToken,
    validateBody(submitAnswerSchema),
    csrfProtection,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { questionId, sessionId, selectedAnswer, timeSpent = 0 } = req.body;

        // Get question to check answer
        const question = await storage.getQuestion(questionId);
        if (!question) {
          return res.status(404).json({ 
            message: 'Question not found',
            code: 'QUESTION_NOT_FOUND'
          });
        }

        const isCorrect = selectedAnswer === question.correctAnswer;

        // Save user answer
        await storage.saveUserAnswer({
          userId: req.user!.id,
          questionId,
          sessionId,
          selectedAnswer,
          isCorrect,
          timeSpent
        });

        // Update session progress
        const session = await storage.updateQuizSession(sessionId, {
          currentQuestionIndex: (await storage.getUserAnswers(sessionId)).length
        });

        res.json({
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          session
        });
      } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ 
          message: 'Failed to submit answer',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.post('/api/quiz/:sessionId/complete',
    quizLimiter,
    authenticateToken,
    validateParams(z.object({ sessionId: z.string().uuid() })),
    csrfProtection,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { sessionId } = req.params;
        
        // Get all answers for score calculation
        const answers = await storage.getUserAnswers(sessionId);
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalQuestions = answers.length;
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Complete session
        const session = await storage.completeQuizSession(sessionId, score);
        
        if (!session) {
          return res.status(404).json({ 
            message: 'Quiz session not found',
            code: 'SESSION_NOT_FOUND'
          });
        }

        // Update user progress
        const totalTimeSpent = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        await storage.upsertUserProgress({
          userId: req.user!.id,
          certificationId: 'aws-cloud-practitioner', // TODO: Get from topic
          topicId: session.topicId,
          totalQuestions,
          completedQuestions: totalQuestions,
          correctAnswers: correctCount,
          bestScore: score,
          lastQuestionIndex: totalQuestions,
          isCompleted: true,
          timeSpent: totalTimeSpent
        });

        res.json({
          session,
          score,
          correctCount,
          totalQuestions,
          answers
        });
      } catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({ 
          message: 'Failed to complete quiz',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  // Progress routes
  app.get('/api/progress/:certificationId',
    validateParams(z.object({ certificationId: z.string() })),
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        const progress = await storage.getUserProgress(req.user!.id, req.params.certificationId);
        res.json(progress);
      } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ 
          message: 'Failed to get progress',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  app.get('/api/quiz-sessions',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        // This would need additional queries in storage - simplified for now
        res.json([]);
      } catch (error) {
        console.error('Get quiz sessions error:', error);
        res.status(500).json({ 
          message: 'Failed to get quiz sessions',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
