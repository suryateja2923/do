import { useAuthContext } from '@/contexts/auth-context';

export const useAuth = () => {
  const context = useAuthContext();
  return {
    currentUser: context.currentUser,
    currentRole: context.currentUser?.role || null,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    logout: context.logout,
    refreshSession: context.refreshSession,
    hasPermission: context.hasPermission,
    canAccess: context.canAccess,
  };
};

export default useAuth;
