import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { User } from '../models/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const userId = new mongoose.mongo.ObjectId();
    const user = new User();
    user.userId = userId;
    user.username = createUserDto.username;
    user.password = createUserDto.password;

    return this.userModel.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  findByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }
}
