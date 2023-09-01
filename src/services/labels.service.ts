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

  async findAll(user): Promise<Response> {
    const labels = await this.labelModel
      .find({ userId: user.userId })
      .lean(true)
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
      this.labelsGateway.server.emit('handleLabels', {
        eventType: 'createLabel',
        data: {
          status: Status.Failure,
          message: 'label already exists',
          data: null,
        },
      });
    }

    const label = new Label();
    label.name = data.name;
    label.userId = userId;
    label.labelId = new mongoose.mongo.ObjectId().toString();

    const labelData = await this.labelModel.create(label);

    if (labelData) {
      this.labelsGateway.server.emit('handleLabels', {
        eventType: 'createLabel',
        data: {
          status: Status.Success,
          message: 'label successfully created',
          data: labelData,
        },
      });
    }
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
      this.labelsGateway.server.emit('handleLabels', {
        eventType: 'updateLabel',
        data: {
          status: Status.Failure,
          message: 'this label does not exist',
          data: null,
        },
      });
    }

    const updatedLabel = await this.labelModel.findOneAndUpdate(
      { labelId, userId },
      { ...data },
    );

    this.labelsGateway.server.emit('handleLabels', {
      eventType: 'updateLabel',
      data: {
        status: Status.Success,
        message: 'label edited successfully',
        data: updatedLabel,
      },
    });
  }

  async remove(labelId: string, userId: string) {
    const label = await this.labelModel.findOne({ labelId, userId });

    if (label == null) {
      this.labelsGateway.server.emit('handleLabels', {
        eventType: 'updateLabel',
        data: {
          status: Status.Failure,
          message: 'this label does not exist',
          data: null,
        },
      });
    }

    await this.labelModel.deleteOne({ userId, labelId });

    this.labelsGateway.server.emit('handleLabels', {
      eventType: 'updateLabel',
      data: {
        status: Status.Success,
        message: 'label has been deleted',
        data: null,
      },
    });
  }
}
