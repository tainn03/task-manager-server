import { AppConfig } from "../config/AppConfig";

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };

    // In production, you might want to use a proper logging library like Winston
    if (AppConfig.NODE_ENV === "development" || level === LogLevel.ERROR) {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  public error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  public debug(message: string, meta?: any): void {
    if (AppConfig.NODE_ENV === "development") {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
}
