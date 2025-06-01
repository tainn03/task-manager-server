import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { IAuthService, ICacheService, IUserRepository } from "../interfaces";
import { AppError } from "../utils/AppError";
import { AppConfig } from "../config/AppConfig";
import { Logger } from "../utils/Logger";

export class AuthService implements IAuthService {
  private logger = Logger.getInstance();

  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async register(email: string, password: string): Promise<void> {
    this.logger.info("Attempting to register user", { email });

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn("Registration failed - user already exists", { email });
      throw new AppError("User already exists", 409);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(
      password,
      AppConfig.BCRYPT_SALT_ROUNDS
    );
    await this.userRepository.create({
      email,
      password: hashedPassword,
    });

    this.logger.info("User registered successfully", { email });
  }

  async login(email: string, password: string): Promise<string> {
    this.logger.info("Attempting to login user", { email });

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn("Login failed - user not found", { email });
      throw new AppError("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn("Login failed - invalid password", { email });
      throw new AppError("Invalid credentials", 401);
    }

    // Generate JWT token
    const jwtSecret = AppConfig.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError("JWT secret is not configured", 500);
    }

    const payload = { userId: user.id };
    const options: SignOptions = {
      expiresIn: AppConfig.JWT_EXPIRES_IN as "1h" | "24h" | "7d" | "30d",
    };
    const token = jwt.sign(payload, jwtSecret, options);

    // Store token in cache
    await this.cacheService.set(
      user.id.toString(),
      token,
      AppConfig.CACHE_TTL.AUTH_TOKEN
    );

    this.logger.info("User logged in successfully", { email, userId: user.id });
    return token;
  }

  async logout(token: string): Promise<void> {
    const userId = await this.validateToken(token);
    if (!userId) {
      this.logger.warn("Logout failed - invalid token", { token });
      throw new AppError("Invalid token", 401);
    }
    await this.cacheService.delete(userId.toString());
    this.logger.info("User logged out successfully", { userId });
  }

  async validateToken(token: string): Promise<number | null> {
    try {
      // Verify JWT token
      const { userId } = jwt.verify(token, AppConfig.JWT_SECRET) as {
        userId: number;
      };

      // Check if token exists in cache
      const cachedToken = await this.cacheService.get(userId.toString());
      if (!cachedToken || cachedToken !== token) {
        return null;
      }

      return userId;
    } catch (error) {
      this.logger.debug("Token validation failed", { error });
      return null;
    }
  }
}
