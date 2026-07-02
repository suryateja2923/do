import { useAuthStore } from '../store/authStore';

export class TokenManager {
  public static getToken(): string | null {
    return useAuthStore.getState().token;
  }

  public static setToken(token: string): void {
    // handled by store
  }

  public static clearSession(): void {
    useAuthStore.getState().logout();
  }
}

export default TokenManager;
