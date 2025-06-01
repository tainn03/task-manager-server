import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Task } from "./entities/Task";
import { AppConfig } from "./config/AppConfig";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: AppConfig.DATABASE.host,
  port: AppConfig.DATABASE.port,
  username: AppConfig.DATABASE.username,
  password: AppConfig.DATABASE.password,
  database: AppConfig.DATABASE.database,
  entities: [User, Task],
  synchronize: AppConfig.NODE_ENV === "development", // Set to false in production
  logging: AppConfig.NODE_ENV === "development",
});
