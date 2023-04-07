import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from 'src/controllers/tasks.controller';
import { Task } from 'src/models/task.entity';
import { TasksService } from 'src/services/tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
