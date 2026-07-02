import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
}

interface TenantProfile {
  id: string;
  user_id: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  permanent_address?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tenantProfile: TenantProfile | null;
  initialized: boolean;
  setSession: (token: string, user: User, tenantProfile: TenantProfile) => void;
  updateProfile: (profile: Partial<User> & Partial<TenantProfile>) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  tenantProfile: null,
  initialized: false,
  setSession: (token, user, tenantProfile) => {
    // In React Native Web / Mobile, we can use local storage or AsyncStorage fallback
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user_token', token);
      window.localStorage.setItem('user_data', JSON.stringify(user));
      window.localStorage.setItem('tenant_profile', JSON.stringify(tenantProfile));
    }
    set({ token, user, tenantProfile });
  },
  updateProfile: (profile) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...profile } : null;
      const updatedTenant = state.tenantProfile ? { ...state.tenantProfile, ...profile } : null;
      if (typeof window !== 'undefined') {
        if (updatedUser) window.localStorage.setItem('user_data', JSON.stringify(updatedUser));
        if (updatedTenant) window.localStorage.setItem('tenant_profile', JSON.stringify(updatedTenant));
      }
      return { user: updatedUser, tenantProfile: updatedTenant };
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user_token');
      window.localStorage.removeItem('user_data');
      window.localStorage.removeItem('tenant_profile');
    }
    set({ token: null, user: null, tenantProfile: null });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('user_token');
      const userData = window.localStorage.getItem('user_data');
      const tenantData = window.localStorage.getItem('tenant_profile');
      if (token && userData && tenantData) {
        set({
          token,
          user: JSON.parse(userData),
          tenantProfile: JSON.parse(tenantData),
          initialized: true,
        });
        return;
      }
    }
    set({ initialized: true });
  },
}));
