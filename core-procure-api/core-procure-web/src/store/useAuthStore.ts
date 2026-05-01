import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('erp_token'),
  setToken: (token: string) => {
    localStorage.setItem('erp_token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('erp_token');
    set({ token: null });
  },
}));
