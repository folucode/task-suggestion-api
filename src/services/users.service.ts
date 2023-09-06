import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../models/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Response, Status } from 'src/utils/response.utils';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findOne(userId: string): Promise<Response> {
    const user = await this.userModel.findOne({ userId });

    if (user == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          status: Status.Failure,
          message: 'user does not exist',
          data: null,
        },
      };
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Success,
        message: 'user profile retrieved successfully',
        data: user,
      },
    };
  }

  async findByUsername(username: string): Promise<Response> {
    const user = await this.userModel.findOne({ username });
    console.log(user);

    if (user == null) {
      return {
        statusCode: HttpStatus.OK,
        data: {
          status: Status.Failure,
          message: 'username is available',
          data: null,
        },
      };
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Failure,
        message: 'username is not available',
        data: null,
      },
    };
  }
}
