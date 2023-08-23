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
  create(
    @Body() createTaskDto: CreateTask,
    @Request() req,
  ): Promise<Response<Task>> {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Put(':taskId')
  update(
    @Param('taskId') taskId: string,
    @Body() taskData: UpdateTask,
    @Request() req,
  ) {
    return this.tasksService.update(taskId, taskData, req.user);
  }

  @Put(':id/mark-as-done')
  markAsDone(@Param('id') id: string, @Request() req): Promise<Task> {
    return this.tasksService.markAsDone(id, req.user);
  }

  @Post(':taskId/subtask')
  createSubtask(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() data: CreateSubtask,
  ): Promise<Response<Subtask>> {
    return this.tasksService.createSubtask(taskId, req.user, data);
  }

  @Put(':taskId/subtasks/:subtaskId')
  updateSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Request() req,
    @Body() taskData: CreateSubtask,
  ): Promise<Response<Subtask>> {
    return this.tasksService.updateSubtask(taskId, subtaskId, taskData);
  }

  @Delete(':id')
  removeTask(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Response<DeleteResult>> {
    return this.tasksService.removeTask(id, req.user);
  }

  @Delete(':taskId/subtasks/:subtaskId')
  removeSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Request() req,
  ): Promise<Response<DeleteResult>> {
    return this.tasksService.removeSubtask(taskId, subtaskId);
  }
}
