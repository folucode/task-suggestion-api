export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  Completed = 'Completed',
  Pending = 'Pending',
}

export class CreateTaskDto {
  userId: string;
  title: string;
  note: string;
  priority: Priority;
}

export class UpdateTaskDto {
  title: string;
  note: string;
  status: Status;
  priority: Priority;
}
