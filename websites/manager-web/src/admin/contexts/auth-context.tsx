'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { User } from '../types';
import { TokenManager } from '../features/authentication/utils/tokenManager';
import { initCrossTabSync } from '../features/authentication/utils/tabSync';

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
  const { user, token, loading, isAuthenticated, login: storeLogin, logout: storeLogout, initSession } = useAuthStore();
  const [syncInitialized, setSyncInitialized] = useState(false);

  // Sync token state on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Synchronise sessions across browser tabs
  useEffect(() => {
    if (syncInitialized) return;
    
    const cleanup = initCrossTabSync(() => {
      storeLogout();
    });
    
    setSyncInitialized(true);
    return () => {
      cleanup();
    };
  }, [storeLogout, syncInitialized]);

  const login = useCallback((email: string, token: string, user: User) => {
    TokenManager.setToken(token);
    TokenManager.setUser(user);
    storeLogin(email, token, user);
  }, [storeLogin]);

  const logout = useCallback(() => {
    TokenManager.clearSession();
    storeLogout();
  }, [storeLogout]);

  const refreshSession = useCallback(async () => {
    const activeToken = TokenManager.getToken();
    if (activeToken && TokenManager.isTokenExpired(activeToken)) {
      // Future token refresh API query placeholder
      logout();
    }
  }, [logout]);

  /**
   * Enterprise RBAC permission resolver
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    // Admins bypass all restrictions
    if (user.role === 'ADMIN') return true;

    // Role-to-Permission sets mapping
    const permissionMap: Record<string, string[]> = {
      OWNER: ['property.create', 'property.update', 'bed.assign', 'invoice.create'],
      MANAGER: ['property.read', 'complaint.resolve', 'tenant.read'],
      USER: ['booking.create', 'complaint.file', 'payment.pay'],
    };

    const userPermissions = permissionMap[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  /**
   * Route authorization guard checker
   */
  const canAccess = useCallback((path: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    // Direct path match controls
    if (path.startsWith('/owners') && user.role !== 'OWNER') return false;
    if (path.startsWith('/managers') && user.role !== 'MANAGER') return false;

    return true;
  }, [user]);

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
