import { Controller, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { RemindersService } from 'src/services/reminder.service';

@UseGuards(AuthGuard)
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: RemindersService) {}

  @Delete(':reminderId')
  remove(@Param('reminderId') reminderId: string, @Request() req) {
    this.reminderService.removeReminder(reminderId, req.user);
  }
}
