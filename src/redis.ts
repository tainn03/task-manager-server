import { createClient } from "redis";
import { AppConfig } from "./config/AppConfig";
import { Logger } from "./utils/Logger";

const logger = Logger.getInstance();

export const redisClient = createClient({
  url: AppConfig.REDIS_URL,
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", { error: err.message });
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info("Redis connection established");
    }
  } catch (error) {
    logger.error("Failed to connect to Redis", { error });
    throw error;
  }
};
