import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ReactNode } from 'react';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('useAuth', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('initializes with unauthenticated state', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('checks auth status on mount when token exists', async () => {
    const mockToken = 'mock-token';
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
    };

    localStorageMock.getItem.mockReturnValue(mockToken);
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles successful login', async () => {
    const mockResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
      },
      token: 'mock-token',
    };

    // Mock CSRF token request
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'csrf-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(loginResult!).toBe(true);
    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token);
  });

  it('handles failed login', async () => {
    const mockError = {
      message: 'Invalid credentials',
      code: 'LOGIN_FAILED',
    };

    // Mock CSRF token request
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'csrf-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(loginResult!).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles successful registration', async () => {
    const mockResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: false,
      },
      token: 'mock-token',
    };

    // Mock CSRF token request
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'csrf-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let registerResult: boolean;
    await act(async () => {
      registerResult = await result.current.register(
        'test@example.com',
        'password123',
        'John',
        'Doe'
      );
    });

    expect(registerResult!).toBe(true);
    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles password reset request', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Reset email sent' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let resetResult: boolean;
    await act(async () => {
      resetResult = await result.current.resetPassword('test@example.com');
    });

    expect(resetResult!).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('refreshes user data', async () => {
    const mockUser = {
      id: '1',
      email: 'updated@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      isEmailVerified: true,
    };

    localStorageMock.getItem.mockReturnValue('mock-token');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toEqual(mockUser);
  });
});
