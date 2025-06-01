import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/Logger";

const logger = Logger.getInstance();

export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    query: req.query,
    ...(req.method !== "GET" && { body: req.body }),
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      responseSize: JSON.stringify(body).length,
    });

    return originalJson.call(this, body);
  };

  next();
};
