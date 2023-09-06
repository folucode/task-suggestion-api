import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { hashPassword, isPasswordMatch } from 'src/utils/auth.utils';
import { SignUpDto } from 'src/dto/auth.dto';
import { Response, Status } from 'src/utils/response.utils';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/models/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly usersModel: Model<User>,
  ) {}

  async signIn(username: string, password: string): Promise<Response> {
    const userExists = await this.usersModel.findOne({ username });

    if (!userExists) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          status: Status.Failure,
          message: 'user does not exist',
          data: null,
        },
      };
    }

    const passwordMatch = await isPasswordMatch(password, userExists.password);

    if (!passwordMatch) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        data: {
          status: Status.Failure,
          message: new UnauthorizedException().message,
          data: null,
        },
      };
    }

    const accessToken = await this.jwtService.signAsync({
      username: userExists.username,
      userId: userExists.userId,
      email: userExists.email,
      fullName: userExists.fullName,
      timezone: userExists.timezone,
    });

    return {
      statusCode: HttpStatus.OK,
      data: {
        status: Status.Success,
        message: 'login successful',
        data: {
          accessToken,
          user: {
            username: userExists.username,
            userId: userExists.userId,
            email: userExists.email,
            fullName: userExists.fullName,
            timezone: userExists.timezone,
          },
        },
      },
    };
  }

  async signUp(data: SignUpDto): Promise<Response> {
    const { username, email, fullName, timezone, password } = data;

    const userExists = await this.usersModel.findOne({ username });

    if (userExists) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        data: {
          status: Status.Failure,
          message: 'username already exists',
          data: null,
        },
      };
    }

    const hash = await hashPassword(password);

    const userData = await this.usersModel.create({
      username,
      email,
      fullName,
      timezone,
      password: hash,
    });

    const accessToken = await this.jwtService.signAsync({
      username: userData.username,
      userId: userData.userId,
      timezone,
      email,
      fullName,
    });

    const { password: userPassword, ...user } = data;

    return {
      statusCode: HttpStatus.CREATED,
      data: {
        status: Status.Success,
        message: 'sign up was successful',
        data: { accessToken, user: JSON.stringify(user) },
      },
    };
  }
}
