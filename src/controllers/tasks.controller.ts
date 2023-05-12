import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Task } from 'src/models/task.entity';
import { TasksService } from 'src/services/tasks.service';
import { DeleteResult } from 'typeorm';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('completed')
  completedTasks(@Request() req): Promise<Task[]> {
    return this.tasksService.getCompletedTasks(req.user);
  }

  @Get()
  findAll(@Request() req): Promise<Task[]> {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') taskID: string, @Request() req): Promise<Task> {
    return this.tasksService.findOne(taskID, req.user);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() taskData: UpdateTaskDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.update(id, taskData, req.user);
  }

  @Put(':id/mark-as-done')
  markAsDone(@Param('id') id: string, @Request() req): Promise<boolean> {
    return this.tasksService.markAsDone(id, req.user);
  }

  @Delete(':id')
  removeTask(@Param('id') id: string, @Request() req): Promise<DeleteResult> {
    return this.tasksService.removeTask(id, req.user);
  }
}
