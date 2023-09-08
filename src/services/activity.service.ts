import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from 'src/models/activity.entity';
import { Response, Status } from 'src/utils/response.utils';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private readonly activityModel: Model<Activity>,
  ) {}

  async getActivity(userId: string): Promise<Response> {
    const activities = await this.activityModel.find({ userId });

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
