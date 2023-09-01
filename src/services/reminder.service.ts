import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReminderGateway } from 'src/gateways/reminder.gateway';
import { Reminder, ReminderDocument } from 'src/models/reminder.entity';
import { Status } from 'src/utils/response.utils';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
    @Inject(ReminderGateway) private readonly reminderGateway: ReminderGateway,
  ) {}

  async removeReminder(reminderId: string, user) {
    const reminder = await this.reminderModel.findOne({
      userId: user.userId,
      reminderId,
    });

    if (reminder == null) {
      this.reminderGateway.server.emit('handleReminders', {
        eventType: 'deleteReminder',
        data: {
          status: Status.Failure,
          message: 'reminder does not exist',
          data: null,
        },
      });
    }

    const taskId = reminder.taskId;

    await this.reminderModel.deleteOne({ reminderId });

    this.reminderGateway.server.emit('handleReminders', {
      eventType: 'deleteReminder',
      data: {
        status: Status.Success,
        message: 'reminder deleted successfully',
        data: { reminderId, taskId },
      },
    });
  }
}
