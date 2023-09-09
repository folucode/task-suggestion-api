import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { ActivityActions } from 'src/models/activity.entity';
import { ActivityService } from 'src/services/activity.service';

@UseGuards(AuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':action?')
  async findAll(
    @Res() res: Response,
    @Request() req,
    @Param('action') action?: ActivityActions,
  ) {
    try {
      const { statusCode, data } = await this.activityService.getActivity(
        req.user.userId,
        action,
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
