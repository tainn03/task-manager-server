import { Router, Request, Response, NextFunction } from "express";
import { DIContainer } from "../config/DIContainer";
import { ITaskService } from "../interfaces/ITaskService";
import { IReminderService } from "../interfaces/IReminderService";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  validateRequest,
  taskValidation,
} from "../middleware/validationMiddleware";
import { ResponseHelper, ResponseTransformer } from "../utils/ResponseHelper";
import {
  CreateTaskRequestDto,
  UpdateTaskRequestDto,
  TaskFilterDto,
} from "../dtos/task.dto";

const router = Router();
const container = DIContainer.getInstance();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all tasks for user with filtering and pagination
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      // Parse query parameters for filtering
      const filters: TaskFilterDto = {
        status: req.query.status as "completed" | "pending" | "all",
        category: req.query.category as
          | "work"
          | "personal"
          | "shopping"
          | "health"
          | "education"
          | "other",
        priority: req.query.priority as "low" | "medium" | "high",
        tags: req.query.tags
          ? (req.query.tags as string).split(",")
          : undefined,
        sortBy: req.query.sortBy as
          | "title"
          | "created"
          | "updated"
          | "dueDate"
          | "priority",
        sortOrder: req.query.sortOrder as "asc" | "desc",
        search: req.query.search as string,
        isArchived: req.query.isArchived === "true",
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      };

      const taskService = container.resolve<ITaskService>("TaskService");
      const paginatedTasks = await taskService.getUserTasks(userId, filters);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformPaginatedTasks(paginatedTasks)
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get task statistics
router.get(
  "/stats",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      const taskService = container.resolve<ITaskService>("TaskService");
      const stats = await taskService.getTaskStats(userId);

      ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
);

// Create task
router.post(
  "/",
  validateRequest(taskValidation.create),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const taskData: CreateTaskRequestDto = req.body;

      const taskService = container.resolve<ITaskService>("TaskService");
      const task = await taskService.createTask(userId, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        tags: taskData.tags,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      });

      ResponseHelper.created(
        res,
        ResponseTransformer.transformTask(task),
        "Task created successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Update task
router.put(
  "/:id",
  validateRequest(taskValidation.update),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      const userId = req.userId!;
      const updates: UpdateTaskRequestDto = req.body;

      if (isNaN(taskId)) {
        return ResponseHelper.error(res, 400, "Invalid task ID");
      }

      // Convert dueDate string to Date if provided
      const taskUpdates = {
        ...updates,
        category: updates.category,
        tags: updates.tags,
        isArchived: updates.isArchived,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
      };

      const taskService = container.resolve<ITaskService>("TaskService");
      const task = await taskService.updateTask(taskId, userId, taskUpdates);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformTask(task),
        "Task updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Bulk update tasks
router.put(
  "/",
  validateRequest(taskValidation.bulkUpdate),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { taskIds, updates } = req.body;

      const taskService = container.resolve<ITaskService>("TaskService");
      const updatedTasks = await taskService.bulkUpdateTasks(
        userId,
        taskIds,
        updates
      );

      ResponseHelper.success(
        res,
        ResponseTransformer.transformTasks(updatedTasks),
        `${updatedTasks.length} tasks updated successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Delete task
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      const userId = req.userId!;

      if (isNaN(taskId)) {
        return ResponseHelper.error(res, 400, "Invalid task ID");
      }

      const taskService = container.resolve<ITaskService>("TaskService");
      await taskService.deleteTask(taskId, userId);

      ResponseHelper.success(res, undefined, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }
);

// Get archived tasks
router.get(
  "/archived",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      const filters: TaskFilterDto = {
        ...req.query,
        isArchived: true,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      };

      const taskService = container.resolve<ITaskService>("TaskService");
      const paginatedTasks = await taskService.getUserTasks(userId, filters);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformPaginatedTasks(paginatedTasks),
        "Archived tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Archive/Unarchive task
router.patch(
  "/:id/archive",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      const userId = req.userId!;
      const { archive = true } = req.body;

      if (isNaN(taskId)) {
        return ResponseHelper.error(res, 400, "Invalid task ID");
      }

      const taskService = container.resolve<ITaskService>("TaskService");
      const task = await taskService.updateTask(taskId, userId, {
        isArchived: archive,
      });

      ResponseHelper.success(
        res,
        ResponseTransformer.transformTask(task),
        `Task ${archive ? "archived" : "unarchived"} successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get tasks by category
router.get(
  "/category/:category",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const category = req.params.category as
        | "work"
        | "personal"
        | "shopping"
        | "health"
        | "education"
        | "other";

      const filters: TaskFilterDto = {
        category,
        isArchived: false,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      };

      const taskService = container.resolve<ITaskService>("TaskService");
      const paginatedTasks = await taskService.getUserTasks(userId, filters);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformPaginatedTasks(paginatedTasks),
        `Tasks in ${category} category retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get overdue tasks
router.get(
  "/overdue",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      const taskService = container.resolve<ITaskService>("TaskService");
      const overdueTasks = await taskService.getOverdueTasks(userId);

      ResponseHelper.success(
        res,
        ResponseTransformer.transformTasks(overdueTasks),
        "Overdue tasks retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get tasks needing reminders (admin or user can check their own)
router.get(
  "/reminders/check",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminderService =
        container.resolve<IReminderService>("ReminderService");
      const tasksNeedingReminder =
        await reminderService.getTasksNeedingReminder();

      ResponseHelper.success(
        res,
        ResponseTransformer.transformTasks(tasksNeedingReminder),
        "Tasks needing reminders retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Manually trigger reminders (useful for testing or admin purposes)
router.post(
  "/reminders/trigger",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminderService =
        container.resolve<IReminderService>("ReminderService");
      await reminderService.scheduleReminders();

      ResponseHelper.success(
        res,
        undefined,
        "Reminders processed successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get advanced analytics
router.get(
  "/analytics",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { timeframe = "30" } = req.query;

      const taskService = container.resolve<ITaskService>("TaskService");
      const analytics = await taskService.getTaskAnalytics(
        userId,
        Number(timeframe)
      );

      ResponseHelper.success(
        res,
        analytics,
        "Task analytics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get productivity insights
router.get(
  "/insights",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      const taskService = container.resolve<ITaskService>("TaskService");
      const insights = await taskService.getProductivityInsights(userId);

      ResponseHelper.success(
        res,
        insights,
        "Productivity insights retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
