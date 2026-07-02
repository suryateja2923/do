import { create } from 'zustand';
import { User, OwnerProfile } from '@/types';
import { TokenManager } from '@/api/TokenManager';
import { apiClient } from '@/api/apiClient';

interface AuthState {
  token: string | null;
  user: User | null;
  ownerProfile: OwnerProfile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (token: string, user: User, ownerProfile: OwnerProfile | null) => void;
  updateProfile: (profile: Partial<OwnerProfile>) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ownerProfile: null,
  loading: false,
  initialized: false,
  setSession: (token, user, ownerProfile) => {
    TokenManager.setToken(token);
    TokenManager.setUser(user);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('owner_token', token);
      window.localStorage.setItem('owner_user', JSON.stringify(user));
      if (ownerProfile) {
        window.localStorage.setItem('owner_profile', JSON.stringify(ownerProfile));
      } else {
        window.localStorage.removeItem('owner_profile');
      }
    }
    set({ token, user, ownerProfile, initialized: true });
  },
  updateProfile: (profile) => {
    set((state) => {
      const updatedProfile = state.ownerProfile ? { ...state.ownerProfile, ...profile } : (profile as OwnerProfile);
      if (typeof window !== 'undefined' && updatedProfile) {
        window.localStorage.setItem('owner_profile', JSON.stringify(updatedProfile));
      }
      return { ownerProfile: updatedProfile };
    });
  },
  logout: () => {
    TokenManager.clearSession();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('owner_token');
      window.localStorage.removeItem('owner_user');
      window.localStorage.removeItem('owner_profile');
    }
    set({ token: null, user: null, ownerProfile: null, initialized: true });
  },
  initialize: async () => {
    if (get().initialized) return;

    let token: string | null = null;
    let user: User | null = null;
    let ownerProfile: OwnerProfile | null = null;

    if (typeof window !== 'undefined') {
      token = window.localStorage.getItem('owner_token');
      const userStr = window.localStorage.getItem('owner_user');
      const profileStr = window.localStorage.getItem('owner_profile');

      if (userStr) {
        try { user = JSON.parse(userStr); } catch {}
      }
      if (profileStr) {
        try { ownerProfile = JSON.parse(profileStr); } catch {}
      }
    }

    if (token && user) {
      TokenManager.setToken(token);
      TokenManager.setUser(user);
      set({ token, user, ownerProfile, loading: true });

      try {
        const response: any = await apiClient.get('/auth/me');
        if (response.success && response.data) {
          const fetchedUser = response.data;
          const fetchedProfile = fetchedUser.owner_profile;

          TokenManager.setUser(fetchedUser);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('owner_user', JSON.stringify(fetchedUser));
            if (fetchedProfile) {
              window.localStorage.setItem('owner_profile', JSON.stringify(fetchedProfile));
            }
          }
          set({
            user: fetchedUser,
            ownerProfile: fetchedProfile,
            token,
            initialized: true,
            loading: false,
          });
          return;
        }
      } catch (err) {
        console.error('Session validation failed, logging out', err);
        TokenManager.clearSession();
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('owner_token');
          window.localStorage.removeItem('owner_user');
          window.localStorage.removeItem('owner_profile');
        }
      }
    }
    set({ token: null, user: null, ownerProfile: null, initialized: true, loading: false });
  },
}));

export default useAuthStore;
