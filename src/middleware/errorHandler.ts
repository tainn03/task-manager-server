import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { AppConfig } from "../config/AppConfig";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(AppConfig.NODE_ENV === "development" && { stack: error.stack }),
    });
    return;
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.message,
    });
    return;
  }

  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message:
      AppConfig.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    ...(AppConfig.NODE_ENV === "development" && { stack: error.stack }),
  });
};
