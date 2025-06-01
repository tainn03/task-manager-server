export interface IAuthService {
  register(email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<string>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<number | null>;
}
