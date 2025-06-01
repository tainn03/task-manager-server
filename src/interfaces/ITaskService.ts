import { Task } from "../entities/Task";
import {
  TaskFilterDto,
  PaginatedTasksDto,
  TaskStatsDto,
  TaskAnalyticsDto,
  ProductivityInsightsDto,
} from "../dtos/task.dto";

export interface ITaskService {
  getUserTasks(
    userId: number,
    filters?: TaskFilterDto
  ): Promise<PaginatedTasksDto>;
  getTaskStats(userId: number): Promise<TaskStatsDto>;
  createTask(
    userId: number,
    taskData: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      category?:
        | "work"
        | "personal"
        | "shopping"
        | "health"
        | "education"
        | "other";
      tags?: string[];
      dueDate?: Date;
    }
  ): Promise<Task>;
  updateTask(
    taskId: number,
    userId: number,
    updates: Partial<Task>
  ): Promise<Task>;
  deleteTask(taskId: number, userId: number): Promise<void>;
  bulkUpdateTasks(
    userId: number,
    taskIds: number[],
    updates: Partial<Task>
  ): Promise<Task[]>;
  getOverdueTasks(userId: number): Promise<Task[]>;
  getTaskAnalytics(
    userId: number,
    timeframeDays: number
  ): Promise<TaskAnalyticsDto>;
  getProductivityInsights(userId: number): Promise<ProductivityInsightsDto>;
}
