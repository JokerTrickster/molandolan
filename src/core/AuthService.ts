const AUTH_TOKEN_KEY = 'authToken';
const AUTH_NICKNAME_KEY = 'authNickname';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  public getNickname(): string | null {
    return localStorage.getItem(AUTH_NICKNAME_KEY);
  }

  public setAuth(token: string, nickname: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_NICKNAME_KEY, nickname);
  }

  public clearAuth(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_NICKNAME_KEY);
  }
}
