import { Response } from "express";
import { Task } from "../entities/Task";
import { TaskResponseDto, PaginatedTasksDto } from "../dtos/task.dto";
import { AuthResponseDto } from "../dtos/auth.dto";

export class ResponseHelper {
  static success<T>(res: Response, data?: T, message?: string): void {
    res.json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data?: T, message?: string): void {
    res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export class ResponseTransformer {
  static transformTask(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      isArchived: task.isArchived,
      dueDate: task.dueDate
        ? typeof task.dueDate === "string"
          ? task.dueDate
          : task.dueDate.toISOString()
        : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  static transformTasks(tasks: Task[]): TaskResponseDto[] {
    return tasks.map(this.transformTask);
  }

  static transformPaginatedTasks(
    paginatedData: PaginatedTasksDto
  ): PaginatedTasksDto {
    return {
      tasks: paginatedData.tasks,
      pagination: paginatedData.pagination,
      stats: paginatedData.stats,
    };
  }

  static transformAuthSuccess(token: string): AuthResponseDto {
    return {
      token,
      message: "Login successfully",
    };
  }

  static transformAuthMessage(message: string): AuthResponseDto {
    return {
      message,
    };
  }
}
