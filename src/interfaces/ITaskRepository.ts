import { Task } from "../entities/Task";
import { TaskFilterDto } from "../dtos/task.dto";

export interface ITaskRepository {
  findById(id: number): Promise<Task | null>;
  findByUserId(
    userId: number,
    filters?: TaskFilterDto
  ): Promise<{
    tasks: Task[];
    total: number;
  }>;
  create(taskData: Partial<Task>): Promise<Task>;
  save(task: Task): Promise<Task>;
  delete(id: number, userId: number): Promise<boolean>;
  bulkUpdate(
    taskIds: number[],
    userId: number,
    updates: Partial<Task>
  ): Promise<Task[]>;
  getTaskStats(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    archived: number;
    categoryStats: Record<string, number>;
    priorityStats: Record<string, number>;
    upcomingTasks: number;
  }>;
  getOverdueTasks(userId: number): Promise<Task[]>;
  getTasksCompletedInPeriod(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]>;
  getTasksCreatedInPeriod(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]>;
}
