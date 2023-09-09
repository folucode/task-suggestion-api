import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateLabel } from 'src/dto/label.dto';
import { LabelsGateway } from 'src/gateways/labels.gateway';
import { Label } from 'src/models/label.entity';
import { Response, Status } from 'src/utils/response.utils';

@Injectable()
export class LabelsService {
  constructor(
    @InjectModel(Label.name)
    private readonly labelModel: Model<Label>,
    @Inject(LabelsGateway) private readonly labelsGateway: LabelsGateway,
  ) {}

  async findAll(userId: string): Promise<Response> {
    const labels = await this.labelModel
      .find({ userId })
      .lean(true)
      .sort({ createdAt: -1, updatedAt: -1 })
      .exec();

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: 'labels successfully fetched',
        status: Status.Success,
        data: labels,
      },
    };
  }

  async create(data: CreateLabel, userId: string) {
    const labelExists = await this.labelModel.findOne({
      name: data.name,
      userId,
    });

    if (labelExists != null) {
      this.labelsGateway.server.emit('createLabel', {
        status: Status.Failure,
        message: 'label already exists',
      });
    }

    const label = new Label();
    label.name = data.name;
    label.userId = userId;
    label.color = data.color;
    label.labelId = new mongoose.mongo.ObjectId().toString();

    await this.labelModel.create(label);

    this.labelsGateway.server.emit('createLabel', {
      status: Status.Success,
      message: 'label successfully created',
    });
  }

  async findOne(labelId: string, userId: string): Promise<Response> {
    const label = await this.labelModel.findOne({
      labelId,
      userId,
    });

    if (label != null) {
      return {
        statusCode: HttpStatus.OK,
        data: {
          status: Status.Success,
          message: 'label fetched successfully',
          data: label,
        },
      };
    }

    return {
      statusCode: HttpStatus.NOT_FOUND,
      data: {
        status: Status.Failure,
        message: 'label not found',
        data: [],
      },
    };
  }

  async update(labelId: string, userId: string, data: CreateLabel) {
    const label = await this.labelModel.findOne({ labelId, userId });

    if (label == null) {
      this.labelsGateway.server.emit('editLabel', {
        status: Status.Failure,
        message: 'this label does not exist',
      });
    }

    await this.labelModel.findOneAndUpdate(
      { labelId, userId },
      { $set: { ...data } },
    );

    this.labelsGateway.server.emit('editLabel', {
      status: Status.Success,
      message: 'label edited successfully',
    });
  }

  async remove(labelId: string, userId: string) {
    const label = await this.labelModel.findOne({ labelId, userId });

    if (label == null) {
      this.labelsGateway.server.emit('deleteLabel', {
        status: Status.Failure,
        message: 'this label does not exist',
      });
    }

    await this.labelModel.deleteOne({ userId, labelId });

    this.labelsGateway.server.emit('deleteLabel', {
      status: Status.Success,
      message: 'label has been deleted',
    });
  }
}
