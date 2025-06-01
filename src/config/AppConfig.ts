import dotenv from "dotenv";

dotenv.config();

export class AppConfig {
  public static readonly PORT = Number(process.env.PORT) || 4000;
  public static readonly JWT_SECRET =
    process.env.JWT_SECRET || "supersecretkey";
  public static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

  public static readonly DATABASE = {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DB || "task_manager",
  };

  public static readonly REDIS_URL =
    process.env.REDIS_URL || "redis://localhost:6379";

  public static readonly NODE_ENV = process.env.NODE_ENV || "development";

  public static readonly BCRYPT_SALT_ROUNDS =
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  public static readonly CACHE_TTL = {
    AUTH_TOKEN: Number(process.env.AUTH_TOKEN_TTL) || 3600, // 1 hour
  };

  public static validate(): void {
    const requiredEnvVars = ["JWT_SECRET"];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is missing`);
      }
    }
  }
}
