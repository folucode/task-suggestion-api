import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { Reminder, ReminderDocument } from 'src/models/reminder.entity';
import { Response, Status } from 'src/utils/response.utils';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
  ) {}

  async removeReminder(
    reminderId: string,
    user,
  ): Promise<Response<DeleteResult>> {
    try {
      const reminder = await this.reminderModel.find({
        userId: user.userId,
        reminderId,
      });

      if (reminder.length < 1) {
        return {
          status: Status.Failure,
          message: 'reminder does not exist',
          data: null,
        };
      }

      const d = await this.reminderModel.deleteOne({ reminderId });

      if (d.deletedCount > 0) {
        return {
          status: Status.Success,
          message: 'reminder deleted successfully',
          data: d,
        };
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
