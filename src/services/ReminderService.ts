import { IReminderService } from "../interfaces/IReminderService";
import { ITaskRepository } from "../interfaces/ITaskRepository";
import { Task } from "../entities/Task";
import { Logger } from "../utils/Logger";

export class ReminderService implements IReminderService {
  private logger = Logger.getInstance();

  constructor(private taskRepository: ITaskRepository) {}

  async getTasksNeedingReminder(): Promise<Task[]> {
    this.logger.info("Fetching tasks needing reminders");

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Get tasks due tomorrow that are not completed
    const upcomingTasks = await this.taskRepository.findByUserId(0, {
      status: "pending",
      limit: 100,
    });

    const tasksNeedingReminder = upcomingTasks.tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Remind 24 hours before due date
      return hoursDiff <= 24 && hoursDiff > 0;
    });

    this.logger.debug("Tasks needing reminder found", {
      count: tasksNeedingReminder.length,
    });

    return tasksNeedingReminder;
  }

  async sendReminder(taskId: number, userId: number): Promise<void> {
    this.logger.info("Sending reminder for task", { taskId, userId });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task not found for reminder", { taskId });
      return;
    }

    // In a real application, this would send an email, push notification, etc.
    // For now, we'll just log it
    this.logger.info("Reminder sent", {
      taskId,
      userId,
      taskTitle: task.title,
      dueDate: task.dueDate,
    });
  }

  async scheduleReminders(): Promise<void> {
    this.logger.info("Starting reminder scheduling process");

    try {
      const tasksNeedingReminder = await this.getTasksNeedingReminder();

      for (const task of tasksNeedingReminder) {
        await this.sendReminder(task.id, task.user.id);
      }

      this.logger.info("Reminder scheduling completed", {
        processedTasks: tasksNeedingReminder.length,
      });
    } catch (error) {
      this.logger.error("Error in reminder scheduling", { error });
    }
  }
}
