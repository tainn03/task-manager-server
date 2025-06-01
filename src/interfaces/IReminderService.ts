import { Task } from "../entities/Task";

export interface IReminderService {
  getTasksNeedingReminder(): Promise<Task[]>;
  sendReminder(taskId: number, userId: number): Promise<void>;
  scheduleReminders(): Promise<void>;
}
