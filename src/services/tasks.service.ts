import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Task, TaskDocument } from 'src/models/task.entity';
import { CreateTaskDto } from 'src/dto/task.dto';
import { UpdateTaskDto } from 'src/dto/task.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpdateResult } from 'mongodb';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  create(createTaskDto: CreateTaskDto, user): Promise<Task> {
    const taskId = new mongoose.mongo.ObjectId();

    const task = new Task();
    task.taskId = taskId;
    task.title = createTaskDto.title;
    task.note = createTaskDto.note;
    task.userId = user.userId;
    task.priority = createTaskDto.priority;
    task.due = createTaskDto.due;

    return this.taskModel.create(task);
  }

  async findAll(user): Promise<Task[]> {
    return this.taskModel.find({ status: 'pending', userId: user.userId });
  }

  findOne(id: string, user): Promise<Task> {
    return this.taskModel.findOne({ _id: id, userId: user.userId });
  }

  async update(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    user,
  ): Promise<UpdateResult> {
    const task = await this.taskModel.findOne({
      _id: taskId,
      userId: user.userId,
    });

    task.note = updateTaskDto.note;
    task.title = updateTaskDto.title;
    task.priority = updateTaskDto.priority;

    return await this.taskModel.updateOne(
      { _id: taskId },
      { ...task },
      { lean: true },
    );
  }

  async markAsDone(taskId: string, user): Promise<Task> {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: taskId, userId: user.userId },
      { $set: { status: 'done' } },
      { lean: true },
    );

    console.log(task, user.userId, taskId);

    return task;

    // const task = await this.taskModel.findOne({
    //   _id: taskId,
    //   userId: user.userId,
    // });

    // task.status = 'done';

    // await this.taskModel.updateOne(
    //   { taskId },
    //   {
    //     ...task,
    //   },
    // );

    // return true;
  }

  // async getCompletedTasks(user): Promise<Task[]> {
  //   return await this.tasksRepository.find({
  //     select: ['taskId', 'note', 'status', 'title', 'priority'],
  //     where: {
  //       status: 'done',
  //       userId: user.userId,
  //     },
  //   });
  // }

  // async removeTask(taskId: string, user): Promise<DeleteResult> {
  //   return await this.tasksRepository.delete({ taskId, userId: user.userId });
  // }

  async getAllTasks(): Promise<Task[] | boolean> {
    const tasks = await this.taskModel.find();

    if (tasks.length < 1) return false;

    return tasks;
  }

  //Jobs
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const tasks = (await this.getAllTasks()) as Array<Task>;

    const tasksWithDueDate = tasks.filter((task) => task.due != null);

    tasksWithDueDate.forEach((taskWithDueDate) => {
      const currentTime = new Date().getTime();
      const timeDue = new Date(taskWithDueDate.due).getTime();

      const timeDifference = timeDue - currentTime;

      const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

      if (timeDifference <= twentyFourHoursInMilliseconds) {
        this.logger.debug(
          `${taskWithDueDate.userId}, task with ID ${taskWithDueDate.taskId} is due in 24 hours`,
        );
      }
    });
  }
}
