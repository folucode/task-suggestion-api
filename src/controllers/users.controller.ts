import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findOne(@Res() res: Response, @Request() req) {
    try {
      const { statusCode, data } = await this.usersService.findOne(
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error', message: error.message });
    }
  }

  @Get(':username')
  async findByUsername(
    @Res() res: Response,
    @Param('username') username: string,
  ) {
    try {
      const { statusCode, data } = await this.usersService.findByUsername(
        username,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error', message: error.message });
    }
  }
}
