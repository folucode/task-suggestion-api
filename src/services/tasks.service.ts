import {
  NotificationPriority,
  NotificationStatus,
  NotificationTypes,
} from './../utils/notification.utils';
import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskDocument } from 'src/models/task.entity';
import { CreateSubtask, CreateTask } from 'src/dto/task.dto';
import { UpdateTask } from 'src/dto/task.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Notification,
  NotificationDocument,
} from 'src/models/notification.entity';
import { Response, Status } from 'src/utils/response.utils';
import { Subtask, SubtaskDocument } from 'src/models/subtask.entity';
import { DeleteResult } from 'mongodb';
import { Reminder, ReminderDocument } from 'src/models/reminder.entity';
import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';
import { User, UserDocument } from 'src/models/user.entity';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Subtask.name)
    private readonly subtaskModel: Model<SubtaskDocument>,
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateTask, user): Promise<any> {
    const taskId = new mongoose.mongo.ObjectId().toString();

    const task = new Task();
    task.taskId = taskId;
    task.title = data.title;
    task.note = data.note;
    task.userId = user.userId;
    task.priority = data.priority;
    task.due = data.due;

    const r = await this.taskModel.create(task);

    if (data.reminderOn) {
      const reminders = data.times.map((time) => {
        const timeInISO = new Date(time).toISOString();

        return new this.reminderModel({
          reminderId: new mongoose.mongo.ObjectId().toString(),
          taskId,
          userId: user.userId,
          time: moment(timeInISO).utc().toString(),
          sent: false,
        });
      });

      this.reminderModel.bulkSave(reminders);
    }

    return {
      status: Status.Success,
      message: 'task added successfully',
      data: r,
    };
  }

  async findAll(user): Promise<Response<Task[]>> {
    const tasks = await this.taskModel.aggregate([
      {
        $match: {
          userId: user.userId,
        },
      },
      {
        $lookup: {
          from: 'subtasks',
          localField: 'taskId',
          foreignField: 'parentTaskId',
          as: 'subtasks',
        },
      },
      {
        $lookup: {
          from: 'reminders',
          localField: 'taskId',
          foreignField: 'taskId',
          as: 'reminders',
        },
      },
      {
        $group: {
          _id: '$status',
          tasks: { $push: '$$ROOT' },
        },
      },
    ]);

    return {
      status: Status.Success,
      message: 'tasks fetched successfully',
      data: tasks,
    };
  }

  async findOne(taskId: string, user): Promise<Response<Task>> {
    const task = await this.taskModel.findOne({ taskId, userId: user.userId });

    if (task == null) {
      return {
        status: Status.Failure,
        message: 'this task does not exist',
        data: null,
      };
    }

    return {
      status: Status.Success,
      message: 'task fetched successfully',
      data: task,
    };
  }

  async update(
    taskId: string,
    updateTaskData: UpdateTask,
    user,
  ): Promise<Response<Task>> {
    const task = await this.taskModel.findOne({
      taskId: taskId,
      userId: user.userId,
    });

    if (task == null) {
      return {
        status: Status.Failure,
        message: ' this task does not exist',
        data: null,
      };
    }

    await this.taskModel.updateOne({ taskId }, { ...updateTaskData });

    const updatedTask = await this.taskModel
      .findOne({
        taskId,
        userId: user.userId,
      })
      .select(['- _id', '- id']);

    return {
      status: Status.Success,
      message: 'task updated successfully',
      data: updatedTask,
    };
  }

  async markAsDone(taskId: string, user): Promise<Task> {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: taskId, userId: user.userId },
      { $set: { status: 'done' } },
      { lean: true },
    );

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

  async removeTask(taskId: string, user): Promise<Response<DeleteResult>> {
    const task = await this.taskModel.findOne({ taskId, userId: user.userId });

    if (task == null) {
      return {
        status: Status.Failure,
        message: 'this task does not exist',
        data: null,
      };
    }

    const r = await this.taskModel.deleteOne({ taskId, userId: user.userId });

    if (r.deletedCount < 1) {
      return {
        status: Status.Failure,
        message: 'could not delete task, something went wrong',
        data: null,
      };
    }

    await this.subtaskModel.deleteMany({ parentTaskId: taskId });

    return {
      status: Status.Success,
      message: 'task deleted successfully',
      data: [],
    };
  }

  async createSubtask(
    taskId: string,
    user,
    subtaskData: CreateSubtask,
  ): Promise<Response<Subtask>> {
    const task = await this.taskModel
      .find({ taskId, userId: user.userId })
      .exec();

    if (task.length < 1) {
      return {
        status: Status.Failure,
        message: 'This parent task does not exist or has been deleted',
        data: null,
      };
    }

    const subtaskTitleExist = await this.subtaskModel.find({
      title: subtaskData.title,
      parentTaskId: taskId,
    });

    if (subtaskTitleExist.length > 0) {
      return {
        status: Status.Failure,
        message: `a subtask with title ${subtaskData.title} already exist`,
        data: null,
      };
    }

    const subtask = new Subtask();
    subtask.due = subtaskData.due;
    subtask.labelId = subtaskData.labelId;
    subtask.note = subtaskData.note;
    subtask.parentTaskId = taskId;
    subtask.priority = subtaskData.priority;
    subtask.subtaskId = new mongoose.mongo.ObjectId().toString();
    subtask.title = subtaskData.title;

    const r = await this.subtaskModel.create(subtask);

    return {
      status: Status.Success,
      message: 'subtask added successfully',
      data: r,
    };
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    taskData: CreateSubtask,
  ): Promise<Response<Subtask>> {
    const subtask = await this.subtaskModel.findOne({
      parentTaskId: taskId,
      subtaskId,
    });

    if (subtask == null) {
      return {
        status: Status.Failure,
        message: 'this task does not exist',
        data: null,
      };
    }

    const u = await this.taskModel.updateOne({ subtaskId }, { ...taskData });

    if (u.modifiedCount < 1) {
      return {
        status: Status.Failure,
        message: 'could not update task, something went wrong',
        data: null,
      };
    }

    const updatedSubtask = await this.subtaskModel.find({
      parentTaskId: taskId,
      subtaskId,
    });

    return {
      status: Status.Success,
      message: 'task updated successfully',
      data: updatedSubtask,
    };
  }

  async removeSubtask(
    taskId: string,
    subtaskId: string,
  ): Promise<Response<DeleteResult>> {
    const subtask = await this.subtaskModel.findOne({
      parentTaskId: taskId,
      subtaskId,
    });

    if (subtask == null) {
      return {
        status: Status.Failure,
        message: 'task does not exist',
        data: null,
      };
    }
    const d = await this.subtaskModel.deleteOne({
      parentTaskId: taskId,
      subtaskId,
    });

    if (d.deletedCount < 1) {
      return {
        status: Status.Failure,
        message: 'could not delete task, something went wrong',
        data: null,
      };
    }

    return {
      status: Status.Success,
      message: 'task deleted successfully',
      data: [],
    };
  }

  async getAllDueTasks(): Promise<Notification[]> {
    const tasks = await this.taskModel.find();

    if (tasks.length < 1) return;

    const tasksWithDueDate = tasks.filter((task) => task.due != null);

    const result = await Promise.all(
      tasksWithDueDate.map(async (taskWithDueDate) => {
        const currentTime = new Date().getTime();
        const timeDue = new Date(taskWithDueDate.due).getTime();

        const timeDifference = timeDue - currentTime;

        const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

        const d = await this.notificationModel.find({
          userId: taskWithDueDate.userId,
          type: NotificationTypes.DueDate,
          content: `Task ${taskWithDueDate.title} is due soon`,
        });

        const inNotificationsTable = d.length < 1;

        if (
          timeDifference <= twentyFourHoursInMilliseconds &&
          inNotificationsTable
        ) {
          return {
            notificationId: new mongoose.Types.ObjectId().toString(),
            userId: taskWithDueDate.userId,
            type: NotificationTypes.DueDate,
            content: `Task ${taskWithDueDate.title} is due soon`,
            status: NotificationStatus.Unread,
            triggeredBy: 'system',
            metadata: JSON.stringify(taskWithDueDate),
            priority: NotificationPriority.High,
          };
        } else {
          return null;
        }
      }),
    );

    const filteredResults = result.filter((r) => r != undefined);

    return filteredResults;
  }

  //Jobs
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleSendReminderCron() {
    const reminders = await this.reminderModel.find({ sent: false });

    Promise.all(
      reminders.map(async (reminder) => {
        try {
          const task = await this.taskModel.findOne({
            taskId: reminder.taskId,
          });
          const user = await this.userModel.findOne({
            userId: reminder.userId,
          });

          const timeInISO = new Date(reminder.time).toISOString();

          const currentTimeInUserTZ = momentTZ().tz(user.timezone);

          const reminderTimeInUserTZ = momentTZ(timeInISO).tz(user.timezone);

          if (currentTimeInUserTZ.isSame(reminderTimeInUserTZ, 'minute')) {
            const mg = new Mailgun(formData).client({
              username: process.env.MAILGUN_USERNAME,
              key: process.env.MAILGUN_API_KEY,
            });

            const r = await mg.messages.create(process.env.MAILGUN_SANDBOX, {
              from: 'TaskApp <mail@taskapp.com>',
              to: user.email,
              subject: 'Reminder Notification',
              text: `Reminder for ${task.title}`,
            });

            this.logger.log(r);

            await this.reminderModel.findOneAndUpdate(
              { reminderId: reminder.reminderId },
              { $set: { sent: true } },
            );
          }
        } catch (error) {
          this.logger.error(error.message);
        }
      }),
    );
  }

  // @Cron(CronExpression.EVERY_5_SECONDS)
  async handleTasksWithDueDateCron() {
    const t = await this.getAllDueTasks();

    if (t.length < 1) return;

    this.notificationModel.insertMany(t);

    // ToDo
    // 1. Implement Queue system and push notifications
    // 2. update notifications table after notification is sent
    // 3. update check parameter to check if a particular notification has been sent
  }
}
