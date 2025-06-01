import "reflect-metadata";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import { connectRedis } from "./redis";
import { AppConfig } from "./config/AppConfig";
import { swaggerSpec } from "./config/swagger";
import { Logger } from "./utils/Logger";
import { errorHandler } from "./middleware/errorHandler";
import { requestLoggingMiddleware } from "./middleware/requestLoggingMiddleware";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";

const app = express();
const logger = Logger.getInstance();

// Validate configuration
AppConfig.validate();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLoggingMiddleware);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Task Manager API Documentation",
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: AppConfig.NODE_ENV,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection with retries
const connectToDatabase = async (retries = 10, delay = 5000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      logger.info("Database connection established");
      return;
    } catch (error) {
      logger.warn(`Database connection attempt ${i + 1}/${retries} failed`, {
        error: error instanceof Error ? error.message : error,
        retryIn: `${delay}ms`,
      });

      if (i === retries - 1) {
        throw new Error(
          `Failed to connect to database after ${retries} attempts`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Redis connection with retries
const connectToRedis = async (retries = 10, delay = 3000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectRedis();
      logger.info("Redis connection established");
      return;
    } catch (error) {
      logger.warn(`Redis connection attempt ${i + 1}/${retries} failed`, {
        error: error instanceof Error ? error.message : error,
        retryIn: `${delay}ms`,
      });

      if (i === retries - 1) {
        throw new Error(`Failed to connect to Redis after ${retries} attempts`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Initialize and start server
const startServer = async (): Promise<void> => {
  try {
    logger.info("Starting server initialization...");

    // Initialize database connection with retries
    await connectToDatabase();

    // Initialize Redis connection with retries
    await connectToRedis();

    // Start server
    app.listen(AppConfig.PORT, () => {
      logger.info(`Server running on port ${AppConfig.PORT}`, {
        port: AppConfig.PORT,
        environment: AppConfig.NODE_ENV,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

startServer();
