export interface TaskStatsDto {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  archived: number;
  completionRate: number;
  categoryStats: Record<string, number>;
  priorityStats: Record<string, number>;
  upcomingTasks: number; // tasks due in next 7 days
}

export interface TaskFilterDto {
  status?: "completed" | "pending" | "all";
  category?:
    | "work"
    | "personal"
    | "shopping"
    | "health"
    | "education"
    | "other";
  priority?: "low" | "medium" | "high";
  tags?: string[];
  sortBy?: "title" | "created" | "updated" | "dueDate" | "priority";
  sortOrder?: "asc" | "desc";
  search?: string;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaginatedTasksDto {
  tasks: TaskResponseDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: TaskStatsDto;
}

export interface CreateTaskRequestDto {
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
  dueDate?: string;
}

export interface UpdateTaskRequestDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  category?:
    | "work"
    | "personal"
    | "shopping"
    | "health"
    | "education"
    | "other";
  tags?: string[];
  isArchived?: boolean;
  dueDate?: string;
}

export interface TaskResponseDto {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: "work" | "personal" | "shopping" | "health" | "education" | "other";
  tags?: string[];
  isArchived: boolean;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAnalyticsDto {
  completedTasksOverTime: { date: string; count: number }[];
  tasksByCategory: Record<string, number>;
  tasksByPriority: Record<string, number>;
  averageCompletionTime: number; // in hours
  productivityTrend: number; // percentage change from previous period
  totalTasksInPeriod: number;
  completedTasksInPeriod: number;
}

export interface ProductivityInsightsDto {
  mostProductiveCategory: string;
  leastProductiveCategory: string;
  averageTasksPerDay: number;
  bestCompletionDay: string; // day of week
  recommendedFocus: string;
  streakDays: number; // consecutive days with completed tasks
  timeToComplete: {
    low: number;
    medium: number;
    high: number;
  };
}
