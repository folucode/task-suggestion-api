import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReminderController } from 'src/controllers/reminder.controller';
import { ReminderGateway } from 'src/gateways/reminder.gateway';
import { Reminder, ReminderSchema } from 'src/models/reminder.entity';
import { RemindersService } from 'src/services/reminder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
  ],
  providers: [RemindersService, ReminderGateway],
  controllers: [ReminderController],
})
export class ReminderModule {}
