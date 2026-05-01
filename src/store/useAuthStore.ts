import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { name: string; email: string; role: string } | null;
  hydrated: boolean;
  setToken: (token: string, user: { name: string; email: string; role: string }) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,
  setToken: (token: string, user: { name: string; email: string; role: string }) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('erp_token', token);
        localStorage.setItem('erp_user', JSON.stringify(user));
      } catch {
        // localStorage may be unavailable in some environments
      }
    }
    set({ token, user, hydrated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      } catch {
        // localStorage may be unavailable in some environments
      }
    }
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: () => {
    // Prevent re-hydration if already done
    if (get().hydrated) return;

    // Only run in browser
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }

    try {
      const token = localStorage.getItem('erp_token');
      const rawUser = localStorage.getItem('erp_user');
      let user: { name: string; email: string; role: string } | null = null;

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          // Validate that parsed user has expected shape
          if (parsed && typeof parsed === 'object' && typeof parsed.email === 'string') {
            user = parsed;
          }
        } catch {
          // Invalid JSON — clear corrupted data
          localStorage.removeItem('erp_user');
        }
      }

      // If token is missing but user data exists (or vice versa), clear both for consistency
      if (!token && user) {
        localStorage.removeItem('erp_user');
        user = null;
      }

      set({ token, user, hydrated: true });
    } catch {
      // Fallback: ensure hydrated is set even on error
      set({ token: null, user: null, hydrated: true });
    }
  },
}));
