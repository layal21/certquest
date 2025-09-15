import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock storage
const mockStorage = {
  getUserProgress: jest.fn(),
  getTopicProgress: jest.fn(),
  upsertUserProgress: jest.fn(),
  getCertifications: jest.fn(),
  getTopicsByCertification: jest.fn(),
  getUser: jest.fn(),
};

jest.mock('../../server/storage', () => ({
  storage: mockStorage,
}));

// Mock auth middleware
jest.mock('../../server/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: '1', email: 'test@example.com' };
    next();
  },
  optionalAuth: (req: any, res: any, next: any) => {
    req.user = { id: '1', email: 'test@example.com' };
    next();
  },
}));

describe('Progress API', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Mock session middleware
    app.use((req, res, next) => {
      req.session = { csrfToken: 'test-csrf-token' } as any;
      next();
    });
    
    server = await registerRoutes(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/progress/:certificationId', () => {
    it('returns user progress for a certification', async () => {
      const mockProgress = [
        {
          id: '1',
          userId: '1',
          certificationId: 'aws-cloud-practitioner',
          topicId: 'global-infrastructure',
          totalQuestions: 10,
          completedQuestions: 8,
          correctAnswers: 7,
          bestScore: 87,
          lastQuestionIndex: 8,
          isCompleted: false,
          timeSpent: 1200,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockStorage.getUserProgress.mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/api/progress/aws-cloud-practitioner')
        .expect(200);

      expect(response.body).toEqual(mockProgress);
      expect(mockStorage.getUserProgress).toHaveBeenCalledWith('1', 'aws-cloud-practitioner');
    });

    it('returns empty array for user with no progress', async () => {
      mockStorage.getUserProgress.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/progress/aws-cloud-practitioner')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('requires authentication', async () => {
      // Mock unauthenticated request
      jest.doMock('../../server/middleware/auth', () => ({
        authenticateToken: (req: any, res: any, next: any) => {
          res.status(401).json({ message: 'Access token required', code: 'TOKEN_REQUIRED' });
        },
      }));

      const response = await request(app)
        .get('/api/progress/aws-cloud-practitioner')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('GET /api/certifications', () => {
    it('returns list of available certifications', async () => {
      const mockCertifications = [
        {
          id: 'aws-cloud-practitioner',
          name: 'AWS Cloud Practitioner',
          description: 'Foundational Level',
          level: 'foundational',
          provider: 'aws',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockStorage.getCertifications.mockResolvedValue(mockCertifications);

      const response = await request(app)
        .get('/api/certifications')
        .expect(200);

      expect(response.body).toEqual(mockCertifications);
      expect(mockStorage.getCertifications).toHaveBeenCalled();
    });

    it('handles empty certification list', async () => {
      mockStorage.getCertifications.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/certifications')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/certifications/:certificationId/topics', () => {
    it('returns topics for a certification', async () => {
      const mockTopics = [
        {
          id: 'global-infrastructure',
          certificationId: 'aws-cloud-practitioner',
          name: 'AWS Global Infrastructure',
          description: 'Understanding AWS Regions, Availability Zones, and Edge Locations',
          orderIndex: 0,
          isActive: true,
        },
        {
          id: 'iam',
          certificationId: 'aws-cloud-practitioner',
          name: 'Identity and Access Management (IAM)',
          description: 'Managing users, groups, roles, and permissions in AWS',
          orderIndex: 1,
          isActive: true,
        },
      ];

      mockStorage.getTopicsByCertification.mockResolvedValue(mockTopics);

      const response = await request(app)
        .get('/api/certifications/aws-cloud-practitioner/topics')
        .expect(200);

      expect(response.body).toEqual(mockTopics);
      expect(mockStorage.getTopicsByCertification).toHaveBeenCalledWith('aws-cloud-practitioner');
    });

    it('returns empty array for certification with no topics', async () => {
      mockStorage.getTopicsByCertification.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/certifications/non-existent/topics')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('handles database errors gracefully', async () => {
      mockStorage.getUserProgress.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/progress/aws-cloud-practitioner')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Failed to get progress');
      expect(response.body).toHaveProperty('code', 'INTERNAL_ERROR');
    });

    it('validates certification ID parameter', async () => {
      const response = await request(app)
        .get('/api/progress/')
        .expect(404);

      // Should return 404 for missing parameter
    });
  });
});
