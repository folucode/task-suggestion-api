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
  title: string;
  note?: string;
  priority: Priority;
  due?: Date;
  labelId?: string;
  reminderOn?: boolean;
  times?: [string];
  recurring?: boolean;
  recurringFrequency?: RecurringTaskFrequency;
}

export interface UpdateTask {
  title?: string;
  note?: string;
  status?: Status;
  priority?: Priority;
  due?: Date;
  reminderOn?: boolean;
  times?: [string];
  recurring?: boolean;
}

export interface CreateSubtask {
  title: string;
  note?: string;
  priority: Priority;
  parentTaskId: string;
  labelId?: string;
  due?: Date;
  status?: Status;
}

export interface CreateReminder {
  reminderId: string;
  taskId: string;
  userId: string;
  time: string;
  sent?: boolean;
}
