import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';

// Mock wouter
const mockUseLocation = jest.fn(() => ['/']);
jest.mock('wouter', () => ({
  useLocation: () => mockUseLocation(),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Mock auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockAuthContext,
}));

describe('Navbar', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderNavbar = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders navbar with logo', () => {
    renderNavbar();
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('link-logo')).toBeInTheDocument();
    expect(screen.getByText('CertPrep')).toBeInTheDocument();
  });

  it('shows sign in and get started buttons when not authenticated', () => {
    renderNavbar();
    
    expect(screen.getByTestId('button-signin')).toBeInTheDocument();
    expect(screen.getByTestId('button-getstarted')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
    };
    
    renderNavbar();
    
    expect(screen.getByTestId('button-user-menu')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', async () => {
    renderNavbar();
    
    const mobileMenuButton = screen.getByTestId('button-mobile-menu');
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });
  });

  it('calls logout when logout button is clicked', async () => {
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
    };
    
    renderNavbar();
    
    const userMenuButton = screen.getByTestId('button-user-menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const logoutButton = screen.getByTestId('button-logout');
      expect(logoutButton).toBeInTheDocument();
      fireEvent.click(logoutButton);
      expect(mockAuthContext.logout).toHaveBeenCalled();
    });
  });

  it('highlights current page in navigation', () => {
    mockUseLocation.mockReturnValue(['/dashboard']);
    
    renderNavbar();
    
    const dashboardLink = screen.getByTestId('link-dashboard');
    expect(dashboardLink).toHaveClass('text-primary', 'font-medium');
  });

  it('has theme toggle button', () => {
    renderNavbar();
    
    expect(screen.getByTestId('button-theme-toggle')).toBeInTheDocument();
  });
});
