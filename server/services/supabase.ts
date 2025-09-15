import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { User } from '@shared/schema';

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

export class AuthService {
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: '7d' }
    );
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return {
          user: null,
          token: null,
          error: 'User already exists with this email'
        };
      }

      // Hash password for our database
      const hashedPassword = await this.hashPassword(password);

      // Create user in our database
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        provider: 'email',
        isEmailVerified: true // For now, skip email verification
      });

      const token = this.generateToken(user.id);

      return {
        user,
        token,
        error: null
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        user: null,
        token: null,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return {
          user: null,
          token: null,
          error: 'Invalid email or password'
        };
      }

      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        return {
          user: null,
          token: null,
          error: 'Invalid email or password'
        };
      }

      const token = this.generateToken(user.id);

      return {
        user,
        token,
        error: null
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        token: null,
        error: 'Login failed. Please try again.'
      };
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; error: string | null }> {
    // For now, email verification is disabled since we're not using Supabase
    return { success: true, error: null };
  }

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // For now, return success but don't actually send an email
      // In a real app, you would send a password reset email here
      return { success: true, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update hashed password in our database
      const hashedPassword = await this.hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });

      return { success: true, error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'Password update failed' };
    }
  }
}

export const authService = new AuthService();
