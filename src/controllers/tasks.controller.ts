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
import { CreateSubtask, CreateTask } from 'src/dto/task.dto';
import { UpdateTask } from 'src/dto/task.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Task } from 'src/models/task.entity';
import { Subtask } from 'src/models/subtask.entity';
import { TasksService } from 'src/services/tasks.service';
import { Response } from 'src/utils/response.utils';
import { DeleteResult } from 'mongodb';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req): Promise<Response<Task[]>> {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id') taskID: string,
    @Request() req,
  ): Promise<Response<Task>> {
    return this.tasksService.findOne(taskID, req.user);
  }

  @Post()
  create(@Body() createTaskDto: CreateTask, @Request() req) {
    this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Put(':taskId')
  update(
    @Param('taskId') taskId: string,
    @Body() taskData: UpdateTask,
    @Request() req,
  ) {
    this.tasksService.update(taskId, taskData, req.user.useId);
  }

  @Put(':taskId/mark-as-done')
  markAsDone(@Param('taskId') taskId: string, @Request() req) {
    this.tasksService.markAsDone(taskId, req.user.userId);
  }

  @Post(':taskId/subtask')
  createSubtask(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() data: CreateSubtask,
  ) {
    this.tasksService.createSubtask(taskId, req.user.userId, data);
  }

  @Put(':taskId/subtasks/:subtaskId')
  updateSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() taskData: CreateSubtask,
  ) {
    this.tasksService.updateSubtask(taskId, subtaskId, taskData);
  }

  @Delete(':taskId')
  removeTask(@Param('taskId') taskId: string, @Request() req) {
    this.tasksService.removeTask(taskId, req.user.userId);
  }

  @Delete(':taskId/subtasks/:subtaskId')
  removeSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    this.tasksService.removeSubtask(taskId, subtaskId);
  }
}
