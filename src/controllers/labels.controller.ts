import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateLabel } from 'src/dto/label.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Label } from 'src/models/label.entity';
import { LabelsService } from 'src/services/labels.service';
import { Response } from 'src/utils/response.utils';

@UseGuards(AuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('')
  findAll(@Request() req): Promise<Response<Label[]>> {
    return this.labelsService.findAll(req.user);
  }

  @Get(':labelId')
  findOne(
    @Param('labelId') labelId: string,
    @Request() req,
  ): Promise<Response<Label>> {
    return this.labelsService.findOne(labelId, req.user.userId);
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
