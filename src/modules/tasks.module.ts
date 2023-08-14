import { TaskSchema } from './../models/task.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from 'src/controllers/tasks.controller';
import { Task } from 'src/models/task.entity';
import { TasksService } from 'src/services/tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
