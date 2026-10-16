import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setActiveRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('ridelink_access_token'),
  refreshToken: localStorage.getItem('ridelink_refresh_token'),
  isAuthenticated: Boolean(localStorage.getItem('ridelink_access_token')),
  isLoading: true,
  activeRole: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('ridelink_access_token', accessToken);
    localStorage.setItem('ridelink_refresh_token', refreshToken);
    localStorage.setItem('ridelink_user', JSON.stringify(user));

    const defaultRole = user.roles.includes('ADMIN')
      ? 'ADMIN'
      : user.roles.includes('DRIVER')
      ? 'DRIVER'
      : 'PASSENGER';

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      activeRole: defaultRole,
    });
  },

  setUser: (user) => {
    localStorage.setItem('ridelink_user', JSON.stringify(user));
    set({ user });
  },

  setActiveRole: (role) => {
    set({ activeRole: role });
  },

  logout: async () => {
    try {
      if (get().refreshToken) {
        await authApi.logout();
      }
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('ridelink_access_token');
      localStorage.removeItem('ridelink_refresh_token');
      localStorage.removeItem('ridelink_user');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        activeRole: null,
      });
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('ridelink_access_token');
    const storedUser = localStorage.getItem('ridelink_user');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const defaultRole = parsed.roles.includes('ADMIN')
          ? 'ADMIN'
          : parsed.roles.includes('DRIVER')
          ? 'DRIVER'
          : 'PASSENGER';

        set({ user: parsed, activeRole: defaultRole });
      } catch {
        // ignore parse error
      }
    }

    try {
      const user = await authApi.getMe();
      const defaultRole = user.roles.includes('ADMIN')
        ? 'ADMIN'
        : user.roles.includes('DRIVER')
        ? 'DRIVER'
        : 'PASSENGER';

      localStorage.setItem('ridelink_user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        activeRole: get().activeRole || defaultRole,
      });
    } catch {
      localStorage.removeItem('ridelink_access_token');
      localStorage.removeItem('ridelink_refresh_token');
      localStorage.removeItem('ridelink_user');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        activeRole: null,
      });
    }
  },
}));

// Listen to custom logout event emitted from Axios 401 refresh failure
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
