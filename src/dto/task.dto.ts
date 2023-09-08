import { RecurringTaskFrequency } from 'src/models/recurring-task.entity';

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  Completed = 'Completed',
  Pending = 'Pending',
}

export interface CreateTask {
  name: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  labelId?: string;
  reminderTime?: string;
  recurringFrequency?: RecurringTaskFrequency;
}

export interface UpdateTask {
  taskId?: string;
  name?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: Date;
  reminderTime?: string;
  recurringFrequency?: RecurringTaskFrequency;
}

export interface CreateSubtask {
  name: string;
  description?: string;
  priority: Priority;
  parentTaskId: string;
  labelId?: string;
  dueDate?: Date;
  status?: Status;
}

export interface CreateReminder {
  reminderId: string;
  taskId: string;
  userId: string;
  time: string;
  sent?: boolean;
}
