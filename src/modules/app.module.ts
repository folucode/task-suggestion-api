import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { TasksModule } from './tasks.module';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';
import { LabelsModule } from './label.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notifications.module';
import { ReminderModule } from './reminder.module';
import { ActivitiesModule } from './activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.wcxfkxq.mongodb.net/task_suggestion?retryWrites=true&w=majority`,
    ),
    UsersModule,
    TasksModule,
    AuthModule,
    LabelsModule,
    NotificationModule,
    ReminderModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
