import {
  Controller,
  Get,
  HttpStatus,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { ActivityService } from 'src/services/activity.service';

@UseGuards(AuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('')
  async findAll(@Res() res: Response, @Request() req) {
    try {
      const { statusCode, data } = await this.activityService.getActivity(
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}
