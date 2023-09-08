import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/models/activity.entity';
import { ActivityService } from 'src/services/activity.service';
import { ActivityController } from 'src/controllers/activity.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
})
export class ActivitiesModule {}
