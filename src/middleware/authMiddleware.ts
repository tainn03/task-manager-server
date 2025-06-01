import { Request, Response, NextFunction } from "express";
import { DIContainer } from "../config/DIContainer";
import { IAuthService } from "../interfaces/IAuthService";
import { AppError } from "../utils/AppError";
import { ICacheService } from "../interfaces";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("No authorization header provided", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const authService =
      DIContainer.getInstance().resolve<IAuthService>("AuthService");
    const userId = await authService.validateToken(token);

    if (!userId) {
      throw new AppError("Invalid or expired token", 401);
    }

    const cacheService =
      DIContainer.getInstance().resolve<ICacheService>("CacheService");
    const existToken = await cacheService.get(userId.toString());
    if (!existToken || existToken !== token) {
      throw new AppError("Token not found in cache", 401);
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};
