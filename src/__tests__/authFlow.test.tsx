import { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

const baseAuthContextValue = {
  currentUser: null,
  userData: null,
  loading: false,
  isAdmin: false,
  isScorer: false,
  isPlayer: true,
  hasClaimedProfile: false,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  logout: vi.fn(),
};

function renderWithAuth(valueOverrides: Partial<typeof baseAuthContextValue>, node: ReactNode) {
  return render(
    <AuthContext.Provider value={{ ...baseAuthContextValue, ...valueOverrides }}>
      {node}
    </AuthContext.Provider>
  );
}

describe('Authentication flow', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('redirects admins to the admin dashboard after login', async () => {
    renderWithAuth(
      {
        currentUser: { uid: 'admin-uid' } as any,
        isAdmin: true,
        hasClaimedProfile: true,
      },
      <Login />
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('redirects players with claimed profiles to the player dashboard', async () => {
    renderWithAuth(
      {
        currentUser: { uid: 'player-uid' } as any,
        hasClaimedProfile: true,
      },
      <Login />
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/player/dashboard', { replace: true });
    });
  });

  it('forces unauthenticated users onto the login page via ProtectedRoute', () => {
    renderWithAuth(
      {
        currentUser: null,
      },
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('redirects non-admins away from admin routes', () => {
    renderWithAuth(
      {
        currentUser: { uid: 'player-uid' } as any,
        isAdmin: false,
      },
      <ProtectedRoute requireAdmin>
        <div>Admin Only</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });

  it('renders children when access requirements are satisfied', () => {
    renderWithAuth(
      {
        currentUser: { uid: 'admin-uid' } as any,
        isAdmin: true,
      },
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).toBeNull();
  });
});

