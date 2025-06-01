import { CacheService } from "../services/CacheService";
import { ReminderService } from "../services/ReminderService";
import { Container } from "./Container";
import {
  IAuthService,
  ICacheService,
  IReminderService,
  ITaskRepository,
  ITaskService,
  IUserRepository,
} from "../interfaces";
import { TaskRepository, UserRepository } from "../repositories";
import { AuthService, TaskService } from "../services";

export class DIContainer {
  private static instance: DIContainer;
  private container: Container;

  private constructor() {
    this.container = new Container();
    this.registerServices();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private registerServices(): void {
    // Register repositories
    this.container.register<IUserRepository>(
      "UserRepository",
      () => new UserRepository()
    );
    this.container.register<ITaskRepository>(
      "TaskRepository",
      () => new TaskRepository()
    );

    // Register services
    this.container.register<ICacheService>(
      "CacheService",
      () => new CacheService()
    );

    this.container.register<IAuthService>(
      "AuthService",
      () =>
        new AuthService(
          this.container.resolve<IUserRepository>("UserRepository"),
          this.container.resolve<ICacheService>("CacheService")
        )
    );

    this.container.register<ITaskService>(
      "TaskService",
      () =>
        new TaskService(
          this.container.resolve<ITaskRepository>("TaskRepository"),
          this.container.resolve<IUserRepository>("UserRepository")
        )
    );

    this.container.register<IReminderService>(
      "ReminderService",
      () =>
        new ReminderService(
          this.container.resolve<ITaskRepository>("TaskRepository")
        )
    );
  }

  public resolve<T>(serviceName: string): T {
    return this.container.resolve<T>(serviceName);
  }
}
