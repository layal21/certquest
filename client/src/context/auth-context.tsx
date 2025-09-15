import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse, ApiError } from '@/types';
import { getAuthToken, setAuthToken, removeAuthToken, getAuthHeaders, addCSRFToken } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        removeAuthToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const headers = await addCSRFToken({
        'Content-Type': 'application/json',
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const authData = data as AuthResponse;
        setAuthToken(authData.token);
        setUser(authData.user);
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        return true;
      } else {
        const error = data as ApiError;
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      const headers = await addCSRFToken({
        'Content-Type': 'application/json',
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        const authData = data as AuthResponse;
        setAuthToken(authData.token);
        setUser(authData.user);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        return true;
      } else {
        const error = data as ApiError;
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const headers = await addCSRFToken({
        'Content-Type': 'application/json',
      });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Reset email sent",
          description: "If an account exists with this email, you'll receive a reset link.",
        });
        return true;
      } else {
        toast({
          title: "Reset failed",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('/api/user/profile', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
