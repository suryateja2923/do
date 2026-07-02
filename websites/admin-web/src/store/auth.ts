import { create } from 'zustand';
import { User } from '../types';
import { TokenManager } from '../features/authentication/utils/tokenManager';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  login: (email, token, user) => {
    TokenManager.setToken(token);
    TokenManager.setUser(user);
    set({ user, token, isAuthenticated: true, loading: false });
  },

  logout: () => {
    TokenManager.clearSession();
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },

  setLoading: (loading) => set({ loading }),

  initSession: () => {
    const token = TokenManager.getToken();
    const user = TokenManager.getUser();

    if (token && user) {
      set({ user, token, isAuthenticated: true, loading: false });
    } else {
      TokenManager.clearSession();
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },
}));

export default useAuthStore;
