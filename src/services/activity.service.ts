import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityActions } from 'src/models/activity.entity';
import { Response, Status } from 'src/utils/response.utils';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private readonly activityModel: Model<Activity>,
  ) {}

  async getActivity(
    userId: string,
    action?: ActivityActions,
  ): Promise<Response> {
    const match = { userId };

    if (action) {
      match['action'] = action;
    }

    const activities = await this.activityModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$date',
            actions: { $push: '$$ROOT' },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by _id (status) ascending
        },
        {
          $unwind: '$actions',
        },
        {
          $sort: { 'actions.createdAt': -1, 'actions.updatedAt': -1 }, // Sort tasks within each group
        },
        {
          $group: {
            _id: '$_id',
            actions: { $push: '$actions' },
          },
        },
      ])
      .sort({ _id: 1 });

    return {
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Success,
        message: 'Activities retrieved successfully',
        data: { activities },
      },
    };
  }
}
