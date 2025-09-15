import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { User } from '@shared/schema';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

export class AuthService {
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret',
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

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // We'll handle email verification separately
        user_metadata: {
          firstName,
          lastName
        }
      });

      if (authError) {
        return {
          user: null,
          token: null,
          error: authError.message
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
        providerId: authData.user.id,
        provider: 'email'
      });

      // Send verification email
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

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

      // Also verify with Supabase
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        return {
          user: null,
          token: null,
          error: 'Authentication failed'
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
    try {
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update user verification status in our database
      if (data.user) {
        const user = await storage.getUserByEmail(data.user.email!);
        if (user) {
          await storage.updateUser(user.id, { isEmailVerified: true });
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed' };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.providerId) {
        return { success: false, error: 'User not found' };
      }

      // Update password in Supabase
      const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(
        user.providerId,
        { password: newPassword }
      );

      if (supabaseError) {
        return { success: false, error: supabaseError.message };
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
