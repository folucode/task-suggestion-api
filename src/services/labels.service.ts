import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateLabel } from 'src/dto/label.dto';
import { Label } from 'src/models/label.entity';
import { Response, Status } from 'src/utils/response.utils';

@Injectable()
export class LabelsService {
  constructor(
    @InjectModel(Label.name)
    private readonly labelModel: Model<Label>,
  ) {}

  async findAll(user): Promise<Response<Label[]>> {
    const labels = await this.labelModel
      .find({ userId: user.userId })
      .lean(true)
      .projection({ _id: 0 })
      .exec();

    return {
      message: 'labels successfully fetched',
      status: Status.Success,
      data: labels,
    };
  }

  async create(data: CreateLabel, user): Promise<Response<Label>> {
    const labelExists = await this.labelModel.findOne({
      name: data.name,
      userId: user.userId,
    });

    if (labelExists != null) {
      return {
        status: Status.Failure,
        message: 'label already exists',
        data: null,
      };
    }

    const label = new Label();
    label.name = data.name;
    label.userId = user.userId;
    label.labelId = new mongoose.mongo.ObjectId().toString();

    const labelData = await this.labelModel.create(label);

    if (labelData) {
      return {
        status: Status.Success,
        message: 'label successfully created',
        data: labelData,
      };
    }
  }

  async findOne(labelId: string, user): Promise<Response<Label>> {
    const label = await this.labelModel.findOne({
      labelId,
      userId: user.userId,
    });

    if (label != null) {
      return {
        status: Status.Success,
        message: 'label fetched successfully',
        data: label,
      };
    }

    return {
      status: Status.Failure,
      message: 'label not found',
      data: [],
    };
  }
}
