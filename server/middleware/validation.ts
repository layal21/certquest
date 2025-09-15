import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Quiz validation schemas
export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  sessionId: z.string().uuid('Invalid session ID'),
  selectedAnswer: z.number().int().min(0, 'Answer index must be non-negative'),
  timeSpent: z.number().int().min(0, 'Time spent must be non-negative').optional(),
});

export const startQuizSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
});

export const updateProgressSchema = z.object({
  certificationId: z.string().min(1, 'Certification ID is required'),
  topicId: z.string().min(1, 'Topic ID is required'),
  completedQuestions: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  timeSpent: z.number().int().min(0),
});

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationError.details,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({
          message: 'Query validation failed',
          errors: validationError.details,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({
          message: 'Parameter validation failed',
          errors: validationError.details,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  };
};
