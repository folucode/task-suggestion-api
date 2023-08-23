import { Controller, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { DeleteResult } from 'mongodb';
import { AuthGuard } from 'src/guards/auth.guard';
import { RemindersService } from 'src/services/reminder.service';
import { Response } from 'src/utils/response.utils';

@UseGuards(AuthGuard)
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: RemindersService) {}

  @Delete(':reminderId')
  remove(
    @Param('reminderId') reminderId: string,
    @Request() req,
  ): Promise<Response<DeleteResult>> {
    return this.reminderService.removeReminder(reminderId, req.user);
  }
}
