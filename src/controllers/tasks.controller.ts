import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Task } from 'src/models/task.entity';
import { TasksService } from 'src/services/tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('suggest')
  suggestTask(): Promise<Task | object> {
    return this.tasksService.suggestTask();
  }

  @Get('completed')
  completedTasks(): Promise<Task[]> {
    return this.tasksService.getCompletedTasks();
  }

  @Get()
  findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') taskID: string): Promise<Task> {
    return this.tasksService.findOne(taskID);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    console.log(createTaskDto);

    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() taskData: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, taskData);
  }

  @Put(':id/mark-as-done')
  markAsDone(@Param('id') id: string): Promise<boolean> {
    return this.tasksService.markAsDone(id);
  }
}
