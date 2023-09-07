import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateLabel } from 'src/dto/label.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { LabelsService } from 'src/services/labels.service';

@UseGuards(AuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('')
  async findAll(@Res() res: Response, @Request() req) {
    try {
      const { statusCode, data } = await this.labelsService.findAll(
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  }

  @Get(':labelId')
  async findOne(
    @Res() res: Response,
    @Param('labelId') labelId: string,
    @Request() req,
  ) {
    try {
      const { statusCode, data } = await this.labelsService.findOne(
        labelId,
        req.user.userId,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  }

  @Post('')
  create(@Body() data: CreateLabel, @Request() req) {
    this.labelsService.create(data, req.user.userId);
  }

  @Put(':labelId')
  update(
    @Body() data: CreateLabel,
    @Request() req,
    @Param('labelId') labelId: string,
  ) {
    this.labelsService.update(labelId, req.user.userId, data);
  }

  @Delete(':labelId')
  remove(@Request() req, @Param('labelId') labelId: string) {
    this.labelsService.remove(labelId, req.user.userId);
  }
}
