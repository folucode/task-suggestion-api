import { ObjectId } from 'mongodb';

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
  labelId?: ObjectId;
}

export interface UpdateTask {
  title?: string;
  note?: string;
  status?: Status;
  priority?: Priority;
  due?: Date;
}

export interface CreateSubtask {
  title: string;
  note?: string;
  priority: Priority;
  parentTaskId: ObjectId;
  labelId?: ObjectId;
  due?: Date;
  status?: Status;
}
