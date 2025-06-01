import { ICacheService } from "../interfaces/ICacheService";
import { redisClient } from "../redis";

export class CacheService implements ICacheService {
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redisClient.set(key, value, { EX: ttl });
    } else {
      await redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await redisClient.get(key);
  }

  async delete(key: string): Promise<void> {
    await redisClient.del(key);
  }
}
