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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Subtask.name, schema: SubtaskSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
