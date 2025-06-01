import { Task } from "../entities/Task";
import { ITaskService } from "../interfaces/ITaskService";
import { ITaskRepository } from "../interfaces/ITaskRepository";
import { IUserRepository } from "../interfaces/IUserRepository";
import {
  TaskFilterDto,
  PaginatedTasksDto,
  TaskStatsDto,
  TaskAnalyticsDto,
  ProductivityInsightsDto,
} from "../dtos/task.dto";
import { AppError } from "../utils/AppError";
import { Logger } from "../utils/Logger";
import { ResponseTransformer } from "../utils/ResponseHelper";

export class TaskService implements ITaskService {
  private logger = Logger.getInstance();

  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository
  ) {}

  async getUserTasks(
    userId: number,
    filters?: TaskFilterDto
  ): Promise<PaginatedTasksDto> {
    this.logger.debug("Fetching tasks for user", { userId, filters });

    const { tasks, total } = await this.taskRepository.findByUserId(
      userId,
      filters
    );
    const stats = await this.getTaskStats(userId);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const pagination = {
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
    };

    this.logger.debug("Tasks fetched successfully", {
      userId,
      taskCount: tasks.length,
      total,
      pagination,
    });

    return {
      tasks: ResponseTransformer.transformTasks(tasks),
      pagination,
      stats,
    };
  }

  async getTaskStats(userId: number): Promise<TaskStatsDto> {
    const stats = await this.taskRepository.getTaskStats(userId);
    const completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return {
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      overdue: stats.overdue,
      archived: stats.archived,
      completionRate,
      categoryStats: stats.categoryStats,
      priorityStats: stats.priorityStats,
      upcomingTasks: stats.upcomingTasks,
    };
  }

  async createTask(
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
  ): Promise<Task> {
    this.logger.info("Creating new task", { userId, taskData });

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn("Task creation failed - user not found", { userId });
      throw new AppError("User not found", 404);
    }

    // Create task
    const task = await this.taskRepository.create({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || "medium",
      category: taskData.category || "other",
      tags: taskData.tags || [],
      dueDate: taskData.dueDate,
      completed: false,
      isArchived: false,
      user,
    });

    this.logger.info("Task created successfully", {
      userId,
      taskId: task.id,
      title: task.title,
    });
    return task;
  }

  async updateTask(
    taskId: number,
    userId: number,
    updates: Partial<Task>
  ): Promise<Task> {
    this.logger.info("Updating task", { taskId, userId, updates });

    // Find task and verify ownership
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task update failed - task not found", {
        taskId,
        userId,
      });
      throw new AppError("Task not found", 404);
    }

    // Verify ownership
    if (task.user.id !== userId) {
      this.logger.warn("Task update failed - access denied", {
        taskId,
        userId,
      });
      throw new AppError("Task not found or access denied", 404);
    }

    // Update task properties
    if (updates.title !== undefined) {
      task.title = updates.title;
    }
    if (updates.description !== undefined) {
      task.description = updates.description;
    }
    if (updates.completed !== undefined) {
      task.completed = updates.completed;
    }
    if (updates.priority !== undefined) {
      task.priority = updates.priority;
    }
    if (updates.category !== undefined) {
      task.category = updates.category;
    }
    if (updates.tags !== undefined) {
      task.tags = updates.tags;
    }
    if (updates.isArchived !== undefined) {
      task.isArchived = updates.isArchived;
    }
    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate;
    }

    const updatedTask = await this.taskRepository.save(task);
    this.logger.info("Task updated successfully", { taskId, userId });
    return updatedTask;
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    this.logger.info("Deleting task", { taskId, userId });

    const deleted = await this.taskRepository.delete(taskId, userId);
    if (!deleted) {
      this.logger.warn(
        "Task deletion failed - task not found or access denied",
        { taskId, userId }
      );
      throw new AppError("Task not found or access denied", 404);
    }

    this.logger.info("Task deleted successfully", { taskId, userId });
  }

  async bulkUpdateTasks(
    userId: number,
    taskIds: number[],
    updates: Partial<Task>
  ): Promise<Task[]> {
    this.logger.info("Bulk updating tasks", { userId, taskIds, updates });

    if (taskIds.length === 0) {
      throw new AppError("No task IDs provided", 400);
    }

    const updatedTasks = await this.taskRepository.bulkUpdate(
      taskIds,
      userId,
      updates
    );

    this.logger.info("Tasks bulk updated successfully", {
      userId,
      updatedCount: updatedTasks.length,
    });

    return updatedTasks;
  }

  async getOverdueTasks(userId: number): Promise<Task[]> {
    this.logger.info("Fetching overdue tasks", { userId });

    const overdueTasks = await this.taskRepository.getOverdueTasks(userId);

    this.logger.debug("Overdue tasks fetched successfully", {
      userId,
      count: overdueTasks.length,
    });

    return overdueTasks;
  }

  async getTaskAnalytics(
    userId: number,
    timeframeDays: number
  ): Promise<TaskAnalyticsDto> {
    this.logger.info("Generating task analytics", { userId, timeframeDays });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeframeDays);

    const completedTasks = await this.taskRepository.getTasksCompletedInPeriod(
      userId,
      startDate,
      endDate
    );
    const createdTasks = await this.taskRepository.getTasksCreatedInPeriod(
      userId,
      startDate,
      endDate
    );

    // Group completed tasks by date
    const completedByDate: Record<string, number> = {};
    completedTasks.forEach((task) => {
      const date = task.updatedAt.toISOString().split("T")[0];
      completedByDate[date] = (completedByDate[date] || 0) + 1;
    });

    const completedTasksOverTime = Object.entries(completedByDate).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    // Analyze by category and priority
    const tasksByCategory: Record<string, number> = {};
    const tasksByPriority: Record<string, number> = {};

    completedTasks.forEach((task) => {
      tasksByCategory[task.category] =
        (tasksByCategory[task.category] || 0) + 1;
      tasksByPriority[task.priority] =
        (tasksByPriority[task.priority] || 0) + 1;
    });

    // Calculate average completion time
    const avgCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            const createdTime = new Date(task.createdAt).getTime();
            const completedTime = new Date(task.updatedAt).getTime();
            return sum + (completedTime - createdTime) / (1000 * 60 * 60); // hours
          }, 0) / completedTasks.length
        : 0;

    // Calculate productivity trend (simple comparison with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - timeframeDays);
    const previousCompletedTasks =
      await this.taskRepository.getTasksCompletedInPeriod(
        userId,
        previousStartDate,
        startDate
      );
    const productivityTrend =
      previousCompletedTasks.length > 0
        ? ((completedTasks.length - previousCompletedTasks.length) /
            previousCompletedTasks.length) *
          100
        : 0;

    this.logger.debug("Task analytics generated successfully", {
      userId,
      completedTasks: completedTasks.length,
      createdTasks: createdTasks.length,
    });

    return {
      completedTasksOverTime,
      tasksByCategory,
      tasksByPriority,
      averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      productivityTrend: Math.round(productivityTrend * 100) / 100,
      totalTasksInPeriod: createdTasks.length,
      completedTasksInPeriod: completedTasks.length,
    };
  }

  async getProductivityInsights(
    userId: number
  ): Promise<ProductivityInsightsDto> {
    this.logger.info("Generating productivity insights", { userId });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const completedTasks = await this.taskRepository.getTasksCompletedInPeriod(
      userId,
      last30Days,
      new Date()
    );
    const stats = await this.getTaskStats(userId);

    // Find most/least productive categories
    const categoryCompletions: Record<string, number> = {};
    const categoryTotals: Record<string, number> = {};

    completedTasks.forEach((task) => {
      categoryCompletions[task.category] =
        (categoryCompletions[task.category] || 0) + 1;
    });

    Object.keys(stats.categoryStats).forEach((category) => {
      categoryTotals[category] = stats.categoryStats[category];
    });

    const categoryRates = Object.keys(categoryTotals).map((category) => ({
      category,
      rate:
        categoryTotals[category] > 0
          ? (categoryCompletions[category] || 0) / categoryTotals[category]
          : 0,
    }));

    categoryRates.sort((a, b) => b.rate - a.rate);

    // Calculate completion times by priority
    const timeToComplete = {
      low: 0,
      medium: 0,
      high: 0,
    };

    ["low", "medium", "high"].forEach((priority) => {
      const priorityTasks = completedTasks.filter(
        (task) => task.priority === priority
      );
      if (priorityTasks.length > 0) {
        timeToComplete[priority as keyof typeof timeToComplete] =
          priorityTasks.reduce((sum, task) => {
            const createdTime = new Date(task.createdAt).getTime();
            const completedTime = new Date(task.updatedAt).getTime();
            return sum + (completedTime - createdTime) / (1000 * 60 * 60); // hours
          }, 0) / priorityTasks.length;
      }
    });

    // Calculate streak days
    const dailyCompletions: Record<string, boolean> = {};
    completedTasks.forEach((task) => {
      const date = task.updatedAt.toISOString().split("T")[0];
      dailyCompletions[date] = true;
    });

    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (dailyCompletions[dateStr]) {
        streakDays++;
      } else {
        break;
      }
    }

    this.logger.debug("Productivity insights generated successfully", {
      userId,
      streakDays,
      categoryRatesCount: categoryRates.length,
    });

    return {
      mostProductiveCategory: categoryRates[0]?.category || "other",
      leastProductiveCategory:
        categoryRates[categoryRates.length - 1]?.category || "other",
      averageTasksPerDay: Math.round((completedTasks.length / 30) * 100) / 100,
      bestCompletionDay: this.getMostProductiveDay(completedTasks),
      recommendedFocus:
        categoryRates[categoryRates.length - 1]?.category ||
        "general productivity",
      streakDays,
      timeToComplete: {
        low: Math.round(timeToComplete.low * 100) / 100,
        medium: Math.round(timeToComplete.medium * 100) / 100,
        high: Math.round(timeToComplete.high * 100) / 100,
      },
    };
  }

  private getMostProductiveDay(tasks: Task[]): string {
    const dayCompletions: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    tasks.forEach((task) => {
      const dayName = task.updatedAt.toLocaleDateString("en-US", {
        weekday: "long",
      });
      dayCompletions[dayName]++;
    });

    return Object.entries(dayCompletions).reduce((a, b) =>
      dayCompletions[a[0]] > dayCompletions[b[0]] ? a : b
    )[0];
  }
}
