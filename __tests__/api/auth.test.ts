import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock storage
const mockStorage = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
};

jest.mock('../../server/storage', () => ({
  storage: mockStorage,
}));

// Mock auth service
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyEmail: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
};

jest.mock('../../server/services/supabase', () => ({
  authService: mockAuthService,
}));

describe('Auth API', () => {
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

  describe('POST /api/auth/register', () => {
    it('successfully registers a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isEmailVerified: false,
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        token: 'mock-token',
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, _csrf: 'test-csrf-token' })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName
      );
    });

    it('returns error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, _csrf: 'test-csrf-token' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('returns error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, _csrf: 'test-csrf-token' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('returns error when user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockAuthService.register.mockResolvedValue({
        user: null,
        token: null,
        error: 'User already exists with this email',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, _csrf: 'test-csrf-token' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists with this email');
      expect(response.body).toHaveProperty('code', 'REGISTRATION_FAILED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('successfully logs in a user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: '1',
        email: loginData.email,
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
      };

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: 'mock-token',
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginData, _csrf: 'test-csrf-token' })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
    });

    it('returns error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockResolvedValue({
        user: null,
        token: null,
        error: 'Invalid email or password',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginData, _csrf: 'test-csrf-token' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
      expect(response.body).toHaveProperty('code', 'LOGIN_FAILED');
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '', _csrf: 'test-csrf-token' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('successfully verifies email', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({
        success: true,
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'verification-token' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email verified successfully');
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('verification-token');
    });

    it('returns error for invalid verification token', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({
        success: false,
        error: 'Invalid verification token',
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid verification token');
      expect(response.body).toHaveProperty('code', 'VERIFICATION_FAILED');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('sends password reset email', async () => {
      mockAuthService.resetPassword.mockResolvedValue({
        success: true,
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset email sent if account exists');
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('validates email format', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Query validation failed');
    });
  });
});
