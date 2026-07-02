export class TokenManager {
  private static token: string | null = null;
  private static user: any | null = null;

  public static setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('owner_token', token);
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = window.localStorage.getItem('owner_token');
    }
    return this.token;
  }

  public static setUser(user: any): void {
    this.user = user;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('owner_user', JSON.stringify(user));
    }
  }

  public static getUser(): any | null {
    if (!this.user && typeof window !== 'undefined') {
      const u = window.localStorage.getItem('owner_user');
      if (u) {
        try { this.user = JSON.parse(u); } catch {}
      }
    }
    return this.user;
  }

  public static clearSession(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('owner_token');
      window.localStorage.removeItem('owner_user');
      window.localStorage.removeItem('owner_profile');
    }
  }
}

export default TokenManager;
