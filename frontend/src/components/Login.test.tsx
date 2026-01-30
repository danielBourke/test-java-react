import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn()
      }
    }
  }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByText(/How to log in/i)).toBeInTheDocument();
    expect(screen.getByText(/Start the backend server/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with the default credentials/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error on invalid credentials', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Unauthorized'));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('admin');
    const passwordInput = screen.getByPlaceholderText('password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpass');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should disable form while loading', async () => {
    // Make the API call take a while
    (api.get as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('admin');
    const passwordInput = screen.getByPlaceholderText('password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, 'password');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  it('should navigate on successful login', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { content: [] } });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('admin');
    const passwordInput = screen.getByPlaceholderText('password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, 'password');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
  });
});
