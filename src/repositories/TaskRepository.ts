import { Repository, Like, In, LessThan, Between } from "typeorm";
import { Task } from "../entities/Task";
import { ITaskRepository } from "../interfaces";
import { TaskFilterDto } from "../dtos/task.dto";
import { AppDataSource } from "../data-source";

export class TaskRepository implements ITaskRepository {
  private repository: Repository<Task>;

  constructor() {
    this.repository = AppDataSource.getRepository(Task);
  }

  async findById(id: number): Promise<Task | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findByUserId(
    userId: number,
    filters?: TaskFilterDto
  ): Promise<{
    tasks: Task[];
    total: number;
  }> {
    const queryBuilder = this.repository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .where("user.id = :userId", { userId });

    // Apply filters
    if (filters?.status && filters.status !== "all") {
      queryBuilder.andWhere("task.completed = :completed", {
        completed: filters.status === "completed",
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere("task.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.priority) {
      queryBuilder.andWhere("task.priority = :priority", {
        priority: filters.priority,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere("JSON_CONTAINS(task.tags, :tags)", {
        tags: JSON.stringify(filters.tags),
      });
    }

    if (filters?.isArchived !== undefined) {
      queryBuilder.andWhere("task.isArchived = :isArchived", {
        isArchived: filters.isArchived,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(task.title LIKE :search OR task.description LIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "desc";

    switch (sortBy) {
      case "title":
        queryBuilder.orderBy(
          "task.title",
          sortOrder.toUpperCase() as "ASC" | "DESC"
        );
        break;
      case "created":
        queryBuilder.orderBy(
          "task.createdAt",
          sortOrder.toUpperCase() as "ASC" | "DESC"
        );
        break;
      case "updated":
        queryBuilder.orderBy(
          "task.updatedAt",
          sortOrder.toUpperCase() as "ASC" | "DESC"
        );
        break;
      case "dueDate":
        queryBuilder.orderBy(
          "task.dueDate",
          sortOrder.toUpperCase() as "ASC" | "DESC"
        );
        break;
      case "priority":
        queryBuilder.orderBy(
          `CASE 
          WHEN task.priority = 'high' THEN 3 
          WHEN task.priority = 'medium' THEN 2 
          ELSE 1 
        END`,
          sortOrder.toUpperCase() as "ASC" | "DESC"
        );
        break;
      default:
        queryBuilder.orderBy("task.createdAt", "DESC");
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    const tasks = await queryBuilder.getMany();

    return { tasks, total };
  }

  async create(taskData: Partial<Task>): Promise<Task> {
    const task = this.repository.create(taskData);
    return await this.repository.save(task);
  }

  async save(task: Task): Promise<Task> {
    return await this.repository.save(task);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.repository.delete({
      id,
      user: { id: userId },
    });
    return (result.affected ?? 0) > 0;
  }

  async bulkUpdate(
    taskIds: number[],
    userId: number,
    updates: Partial<Task>
  ): Promise<Task[]> {
    await this.repository.update(
      {
        id: In(taskIds),
        user: { id: userId },
      },
      updates
    );

    return await this.repository.find({
      where: {
        id: In(taskIds),
        user: { id: userId },
      },
      relations: ["user"],
    });
  }

  async getTaskStats(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    archived: number;
    categoryStats: Record<string, number>;
    priorityStats: Record<string, number>;
    upcomingTasks: number;
  }> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // Basic counts
    const total = await this.repository.count({
      where: { user: { id: userId } },
    });

    const completed = await this.repository.count({
      where: {
        user: { id: userId },
        completed: true,
      },
    });

    const archived = await this.repository.count({
      where: {
        user: { id: userId },
        isArchived: true,
      },
    });

    // Overdue tasks (past due date and not completed)
    const overdue = await this.repository.count({
      where: {
        user: { id: userId },
        completed: false,
        dueDate: LessThan(now),
      },
    });

    // Upcoming tasks (due in next 7 days)
    const upcomingTasks = await this.repository.count({
      where: {
        user: { id: userId },
        completed: false,
        dueDate: Between(now, nextWeek),
      },
    });

    // Category statistics
    const categoryStats: Record<string, number> = {};
    const categories = [
      "work",
      "personal",
      "shopping",
      "health",
      "education",
      "other",
    ];
    for (const category of categories) {
      categoryStats[category] = await this.repository.count({
        where: {
          user: { id: userId },
          category: category as any,
        },
      });
    }

    // Priority statistics
    const priorityStats: Record<string, number> = {};
    const priorities = ["low", "medium", "high"];
    for (const priority of priorities) {
      priorityStats[priority] = await this.repository.count({
        where: {
          user: { id: userId },
          priority: priority as any,
        },
      });
    }

    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      overdue,
      archived,
      categoryStats,
      priorityStats,
      upcomingTasks,
    };
  }

  async getOverdueTasks(userId: number): Promise<Task[]> {
    const now = new Date();

    return await this.repository.find({
      where: {
        user: { id: userId },
        completed: false,
        isArchived: false,
        dueDate: LessThan(now),
      },
      relations: ["user"],
      order: {
        dueDate: "ASC",
      },
    });
  }

  async getTasksCompletedInPeriod(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]> {
    return await this.repository.find({
      where: {
        user: { id: userId },
        completed: true,
        updatedAt: Between(startDate, endDate),
      },
      relations: ["user"],
      order: {
        updatedAt: "ASC",
      },
    });
  }

  async getTasksCreatedInPeriod(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]> {
    return await this.repository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDate, endDate),
      },
      relations: ["user"],
      order: {
        createdAt: "ASC",
      },
    });
  }
}
