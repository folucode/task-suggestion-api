import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecurringTaskDocument = HydratedDocument<RecurringTask>;

export enum RecurringTaskFrequency {
  HOURLY = 'hourly',
  DAILY = 'Daily',
  WEEKDAYS = 'Weekdays',
  WEEKLY = 'Weekly',
  FORTNIGHTLY = 'Fortnightly',
  MONTHLY = 'Monthly',
  EVERY_3_MONTHS = 'Every 3 Months',
  EVERY_6_MONTHS = 'Every 6 Months',
  YEARLY = 'Yearly',
}

@Schema({ timestamps: true, collection: 'recurringTasks' })
export class RecurringTask {
  @Prop({ required: true })
  recurringTaskId: string;

  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true, enum: RecurringTaskFrequency })
  frequency: RecurringTaskFrequency;

  @Prop({ required: true })
  nextDate: string;
}

export const RecurringTaskSchema = SchemaFactory.createForClass(RecurringTask);
