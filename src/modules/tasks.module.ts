import { TaskSchema } from './../models/task.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from 'src/controllers/tasks.controller';
import { Task } from 'src/models/task.entity';
import { TasksService } from 'src/services/tasks.service';
import {
  Notification,
  NotificationSchema,
} from 'src/models/notification.entity';
import { Subtask, SubtaskSchema } from 'src/models/subtask.entity';
import { Reminder, ReminderSchema } from 'src/models/reminder.entity';
import { User, UserSchema } from 'src/models/user.entity';
import {
  RecurringTask,
  RecurringTaskSchema,
} from 'src/models/recurring-task.entity';
import { TasksGateway } from 'src/gateways/tasks.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Subtask.name, schema: SubtaskSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: User.name, schema: UserSchema },
      { name: RecurringTask.name, schema: RecurringTaskSchema },
    ]),
  ],
  providers: [TasksService, TasksGateway],
  controllers: [TasksController],
})
export class TasksModule {}
