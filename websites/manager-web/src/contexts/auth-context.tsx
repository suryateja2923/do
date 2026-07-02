'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { User } from '@/types';
import { TokenManager } from '@/features/authentication/utils/tokenManager';
import { initCrossTabSync } from '@/features/authentication/utils/tabSync';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, token: string, user: User) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    token,
    loading,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    initSession,
  } = useAuthStore();

  const [syncInitialized, setSyncInitialized] = useState(false);

  // Restore session from storage on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Cross-tab sync: log out all tabs when token is removed in one
  useEffect(() => {
    if (syncInitialized) return;
    const cleanup = initCrossTabSync(() => {
      storeLogout();
      if (typeof window !== 'undefined') {
        window.location.replace('/session-expired');
      }
    });
    setSyncInitialized(true);
    return () => cleanup();
  }, [storeLogout, syncInitialized]);

  const login = useCallback(
    (email: string, token: string, user: User) => {
      storeLogin(email, token, user);
    },
    [storeLogin]
  );

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  const refreshSession = useCallback(async () => {
    const activeToken = TokenManager.getToken();
    if (!activeToken || TokenManager.isTokenExpired(activeToken)) {
      logout();
    }
  }, [logout]);

  /** RBAC permission resolver — managers have a defined permission set */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      const permissionMap: Record<string, string[]> = {
        MANAGER: [
          'owner.read', 'owner.approve', 'owner.reject',
          'property.read', 'property.approve', 'property.reject',
          'booking.read', 'booking.approve',
          'complaint.read', 'complaint.resolve',
          'task.read', 'task.update',
          'notification.send',
          'report.read',
        ],
      };
      return (permissionMap[user.role] || []).includes(permission);
    },
    [user]
  );

  /** Route authorization guard */
  const canAccess = useCallback(
    (path: string): boolean => {
      if (!user) return false;
      if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser: user,
        token,
        isAuthenticated,
        isLoading: loading,
        login,
        logout,
        refreshSession,
        hasPermission,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be called within an AuthProviderContext');
  }
  return context;
};
