import { Status as TaskStatus } from './../dto/task.dto';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationTypes,
} from './../utils/notification.utils';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
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
import { Reminder, ReminderDocument } from 'src/models/reminder.entity';
import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';
import { User, UserDocument } from 'src/models/user.entity';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import {
  RecurringTask,
  RecurringTaskDocument,
  RecurringTaskFrequency,
} from 'src/models/recurring-task.entity';
import { TasksGateway } from 'src/gateways/tasks.gateway';
import {
  TaskHistory,
  TaskHistoryDocument,
} from 'src/models/task-history.entity';

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
    @InjectModel(RecurringTask.name)
    private readonly recurringTaskModel: Model<RecurringTaskDocument>,
    @Inject(TasksGateway) private readonly tasksGateway: TasksGateway,
    @InjectModel(TaskHistory.name)
    private readonly taskHistoryModel: Model<TaskHistoryDocument>,
  ) {}

  async create(data: CreateTask, userId: string) {
    try {
      const taskId = new mongoose.mongo.ObjectId().toString();

      const task = new Task();
      task.taskId = taskId;
      task.title = data.title;
      task.note = data.note;
      task.userId = userId;
      task.priority = data.priority;
      task.due = data.due;

      const newTask = await this.taskModel.create(task);

      if (data.reminderOn) {
        const reminders = data.times.map((time) => {
          const timeInISO = new Date(time).toISOString();

          return new this.reminderModel({
            reminderId: new mongoose.mongo.ObjectId().toString(),
            taskId,
            userId,
            time: moment(timeInISO).utc().toString(),
            sent: false,
          });
        });

        this.reminderModel.bulkSave(reminders);
      }

      if (data.recurring) {
        let nextDate = '';

        switch (data.recurringFrequency) {
          case RecurringTaskFrequency.DAILY:
            nextDate = moment().utc().add(1, 'd').toISOString();
            break;
          case RecurringTaskFrequency.WEEKLY:
            nextDate = moment().utc().add(1, 'w').toISOString();
            break;
          case RecurringTaskFrequency.HOURLY:
            nextDate = moment().utc().add(1, 'h').toISOString();
            break;
          case RecurringTaskFrequency.WEEKDAYS:
            nextDate = moment()
              .utc()
              .day(this.nextWeekday(moment().utc()))
              .toISOString();
            break;
          case RecurringTaskFrequency.FORTNIGHTLY:
            nextDate = moment().utc().add(2, 'w').toISOString();
            break;
          case RecurringTaskFrequency.MONTHLY:
            nextDate = moment().utc().add(1, 'M').toISOString();
            break;
          case RecurringTaskFrequency.EVERY_3_MONTHS:
            nextDate = moment().utc().add(3, 'M').toISOString();
            break;
          case RecurringTaskFrequency.EVERY_6_MONTHS:
            nextDate = moment().utc().add(6, 'M').toISOString();
            break;
          case RecurringTaskFrequency.YEARLY:
            nextDate = moment().utc().add(1, 'y').toISOString();
            break;
        }

        const recurringTask = new RecurringTask();
        recurringTask.recurringTaskId =
          new mongoose.Types.ObjectId().toString();
        recurringTask.frequency = data.recurringFrequency;
        recurringTask.taskId = taskId;
        recurringTask.nextDate = nextDate;

        await this.recurringTaskModel.create(recurringTask);
      }

      this.tasksGateway.server.emit('handleTask', {
        eventType: 'createTask',
        data: {
          status: Status.Success,
          message: 'task successfully created',
          data: newTask,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('createTask', error.message);
    }
  }

  async findAll(userId: string): Promise<Response> {
    const tasks = await this.taskModel.aggregate([
      {
        $match: {
          userId,
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
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Success,
        message: 'tasks fetched successfully',
        data: tasks,
      },
    };
  }

  async findOne(taskId: string, userId: string): Promise<Response> {
    const task = await this.taskModel.findOne({ taskId, userId });

    if (task == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          status: Status.Failure,
          message: 'this task does not exist',
          data: null,
        },
      };
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Success,
        message: 'task fetched successfully',
        data: task,
      },
    };
  }

  async update(taskId: string, updateTaskData: UpdateTask, userId: string) {
    try {
      const task = await this.taskModel.findOne({
        taskId: taskId,
        userId,
      });

      if (task == null) {
        this.tasksGateway.server.emit('handleTask', {
          eventType: 'updateTask',
          data: {
            status: Status.Failure,
            message: ' this task does not exist',
            data: null,
          },
        });
      }

      const updatedTask = await this.taskModel
        .findOneAndUpdate({ taskId }, { ...updateTaskData })
        .select(['- _id', '- id']);

      this.tasksGateway.server.emit('handleTask', {
        eventType: 'updateTask',
        data: {
          status: Status.Success,
          message: 'task updated successfully',
          data: updatedTask,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('updateTask', {
        status: Status.Failure,
        message: error.message,
      });
    }
  }

  async markAsDone(taskId: string, userId: string) {
    try {
      const taskHistoryId = new mongoose.Types.ObjectId().toString();

      const timeInISO = new Date().toISOString();

      const dateCompleted = moment(timeInISO).utc().toString();

      const task = await this.taskModel.findOne({
        taskId,
        userId,
      });

      if (task == null) {
        this.tasksGateway.server.emit('handleTask', {
          eventType: 'completeTask',
          data: {
            status: Status.Failure,
            message: 'task does not exist',
            data: null,
          },
        });
      }

      const updatedTask = await this.taskModel.findOneAndUpdate(
        { taskId, userId },
        { $set: { status: TaskStatus.Completed } },
      );

      await this.taskHistoryModel.create({
        userId,
        taskId,
        taskHistoryId,
        dateCompleted,
      });

      this.tasksGateway.server.emit('handleTask', {
        eventType: 'completeTask',
        data: {
          status: Status.Success,
          message: 'task updated successfully',
          data: updatedTask,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('completeTask', {
        status: Status.Failure,
        message: error.message,
      });
    }
  }

  async removeTask(taskId: string, userId: string) {
    try {
      const task = await this.taskModel.findOne({ taskId, userId });

      if (task == null) {
        this.tasksGateway.server.emit('handleTask', {
          eventType: 'deleteTask',
          data: {
            status: Status.Failure,
            message: 'this task does not exist',
            data: null,
          },
        });
      }

      const d = await this.taskModel.deleteOne({ taskId, userId });

      if (d.deletedCount < 1) {
        this.tasksGateway.server.emit('handleTask', {
          eventType: 'deleteTask',
          data: {
            status: Status.Failure,
            message: 'could not delete task, something went wrong',
            data: null,
          },
        });
      }

      await this.subtaskModel.deleteMany({ parentTaskId: taskId });

      const tasks = await this.taskModel.find({ userId });

      this.tasksGateway.server.emit('handleTask', {
        eventType: 'deleteTask',
        data: {
          status: Status.Success,
          message: 'task deleted successfully',
          data: tasks,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('deleteTask', {
        status: Status.Failure,
        message: error.message,
      });
    }
  }

  async createSubtask(
    taskId: string,
    userId: string,
    subtaskData: CreateSubtask,
  ) {
    try {
      const task = await this.taskModel.findOne({ taskId, userId }).exec();

      if (task == null) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'createSubtask',
          data: {
            status: Status.Failure,
            message: 'This parent task does not exist or has been deleted',
            data: null,
          },
        });
      }

      const subtaskTitleExist = await this.subtaskModel.findOne({
        title: subtaskData.title,
        parentTaskId: taskId,
      });

      if (subtaskTitleExist != null) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'createSubtask',
          data: {
            status: Status.Failure,
            message: `a subtask with title ${subtaskData.title} already exist`,
            data: null,
          },
        });
      }

      const subtask = new Subtask();
      subtask.due = subtaskData.due;
      subtask.labelId = subtaskData.labelId;
      subtask.note = subtaskData.note;
      subtask.parentTaskId = taskId;
      subtask.priority = subtaskData.priority;
      subtask.subtaskId = new mongoose.mongo.ObjectId().toString();
      subtask.title = subtaskData.title;

      const newSubtask = await this.subtaskModel.create(subtask);

      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'createSubtask',
        data: {
          status: Status.Success,
          message: 'subtask added successfully',
          data: newSubtask,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'createSubtask',
        data: {
          status: Status.Failure,
          message: error.message,
        },
      });
    }
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    taskData: CreateSubtask,
  ) {
    try {
      const subtask = await this.subtaskModel.findOne({
        parentTaskId: taskId,
        subtaskId,
      });

      if (subtask == null) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'updateSubtask',
          data: {
            status: Status.Failure,
            message: 'This task does not exist or has been deleted',
            data: null,
          },
        });
      }

      const updatedTask = await this.subtaskModel.findOneAndUpdate(
        { subtaskId },
        { ...taskData },
      );

      if (updatedTask == null) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'updateSubtask',
          data: {
            status: Status.Failure,
            message: 'could not update task, something went wrong',
            data: null,
          },
        });
      }

      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'updateSubtask',
        data: {
          status: Status.Success,
          message: 'task updated successfully',
          data: updatedTask,
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'updateSubtask',
        data: {
          status: Status.Success,
          message: error.message,
        },
      });
    }
  }

  async removeSubtask(taskId: string, subtaskId: string) {
    try {
      const subtask = await this.subtaskModel.findOne({
        parentTaskId: taskId,
        subtaskId,
      });

      if (subtask == null) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'deleteSubtask',
          data: {
            status: Status.Failure,
            message: 'task does not exist',
            data: null,
          },
        });
      }
      const d = await this.subtaskModel.deleteOne({
        parentTaskId: taskId,
        subtaskId,
      });

      if (d.deletedCount < 1) {
        this.tasksGateway.server.emit('handleSubtask', {
          eventType: 'deleteSubtask',
          data: {
            status: Status.Failure,
            message: 'could not delete task, something went wrong',
            data: null,
          },
        });
      }

      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'deleteSubtask',
        data: {
          status: Status.Success,
          message: 'task deleted successfully',
          data: [],
        },
      });
    } catch (error) {
      this.tasksGateway.server.emit('handleSubtask', {
        eventType: 'deleteSubtask',
        data: {
          status: Status.Success,
          message: error.message,
        },
      });
    }
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
  // @Cron(CronExpression.EVERY_10_SECONDS)
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

  @Cron(CronExpression.EVERY_SECOND)
  async handleRecurringTaskCron() {
    const tasks = await this.taskModel.find({ recurring: true });

    tasks.forEach(async (task) => {
      const recurringTask = await this.recurringTaskModel.findOne({
        taskId: task.taskId,
      });

      const user = await this.userModel.findOne({ userId: task.userId });

      if (recurringTask !== null) {
        const timeInISO = new Date(recurringTask.nextDate).toISOString();

        const currentTimeInUserTZ = momentTZ().tz(user.timezone);

        const recurringTaskDate = momentTZ(timeInISO).tz(user.timezone);

        if (currentTimeInUserTZ.isSame(recurringTaskDate, 'minute')) {
          await this.taskModel.findOneAndUpdate(
            { taskId: recurringTask.taskId },
            {
              $set: {
                status: TaskStatus.Pending,
              },
            },
            {
              new: true,
            },
          );

          let nextDate = '';

          switch (recurringTask.frequency) {
            case RecurringTaskFrequency.DAILY:
              nextDate = moment().utc().add(1, 'd').toISOString();
              break;
            case RecurringTaskFrequency.WEEKLY:
              nextDate = moment().utc().add(1, 'w').toISOString();
              break;
            case RecurringTaskFrequency.HOURLY:
              nextDate = moment().utc().add(1, 'h').toISOString();
              break;
            case RecurringTaskFrequency.WEEKDAYS:
              nextDate = moment()
                .utc()
                .day(this.nextWeekday(moment().utc()))
                .toISOString();
              break;
            case RecurringTaskFrequency.FORTNIGHTLY:
              nextDate = moment().utc().add(2, 'w').toISOString();
              break;
            case RecurringTaskFrequency.MONTHLY:
              nextDate = moment().utc().add(1, 'M').toISOString();
              break;
            case RecurringTaskFrequency.EVERY_3_MONTHS:
              nextDate = moment().utc().add(3, 'M').toISOString();
              break;
            case RecurringTaskFrequency.EVERY_6_MONTHS:
              nextDate = moment().utc().add(6, 'M').toISOString();
              break;
            case RecurringTaskFrequency.YEARLY:
              nextDate = moment().utc().add(1, 'y').toISOString();
              break;
          }
        }
      }
    });
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

  nextWeekday = (date) => {
    const dayOfWeek = date.add(1, 'd').weekday();

    return dayOfWeek === 6 ? 6 + 2 : dayOfWeek;
  };
}
