import { AUTH_CONFIG } from '@/config/auth';
import { User } from '@/types';

export class TokenManager {
  /** Get raw token from client-side storage */
  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
  }

  /** Set raw token and synchronize with browser cookies for middleware visibility */
  public static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, token);
    // Write cookie so Next.js Edge Middleware can read it
    document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
  }

  /** Remove token and expire cookie */
  public static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }

  /** Get cached user object */
  public static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /** Set cached user object */
  public static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
  }

  /** Decode JWT token payload (base64url → JSON) */
  public static decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /** Check if token is expired based on JWT exp epoch */
  public static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 - Date.now() < 10000; // expired or within 10s
  }

  /** Wipe all session storage keys and cookies */
  public static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY);
    document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

export default TokenManager;
