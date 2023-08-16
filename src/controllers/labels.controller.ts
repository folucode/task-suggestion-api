import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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

  // @Get('')
  // findAll(@Request() req): Promise<Response<Label[]>> {
  //   return this.labelsService.findAll(req.user);
  // }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<Response<Label>> {
    return this.labelsService.findOne(id, req.user);
  }

  @Post('')
  create(@Body() data: CreateLabel, @Request() req): Promise<Response<Label>> {
    return this.labelsService.create(data, req.user);
  }
}
