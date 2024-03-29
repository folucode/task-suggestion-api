import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabelsController } from 'src/controllers/labels.controller';
import { LabelsGateway } from 'src/gateways/labels.gateway';
import { Label, LabelSchema } from 'src/models/label.entity';
import { LabelsService } from 'src/services/labels.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Label.name, schema: LabelSchema }]),
  ],
  providers: [LabelsService, LabelsGateway],
  controllers: [LabelsController],
})
export class LabelsModule {}
