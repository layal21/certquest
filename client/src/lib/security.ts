import DOMPurify from 'dompurify';

// XSS Protection
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty);
};

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// CSRF Protection
export const getCSRFToken = async (): Promise<string> => {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.csrfToken;
};

export const addCSRFToken = async (headers: HeadersInit = {}): Promise<HeadersInit> => {
  const token = await getCSRFToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
};

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Input validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting helpers (client-side awareness)
export const isRateLimited = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  // Save updated attempts
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts));
  
  return recentAttempts.length >= maxAttempts;
};

export const recordAttempt = (key: string): void => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  attempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(attempts));
};
