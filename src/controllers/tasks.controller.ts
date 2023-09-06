import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateSubtask, CreateTask } from 'src/dto/task.dto';
import { UpdateTask } from 'src/dto/task.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { TasksService } from 'src/services/tasks.service';
import { Response } from 'express';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Res() res: Response, @Request() req) {
    try {
      const { statusCode, data } = await this.tasksService.findAll(
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error', message: error.message });
    }
  }

  @Get(':id')
  async findOne(
    @Res() res: Response,
    @Param('id') taskID: string,
    @Request() req,
  ) {
    try {
      const { statusCode, data } = await this.tasksService.findOne(
        taskID,
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error', message: error.message });
    }
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
    this.tasksService.update(taskId, taskData, req.user.userId);
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
