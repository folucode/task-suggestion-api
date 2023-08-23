import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReminderDocument = HydratedDocument<Reminder>;

@Schema({ timestamps: true, collection: 'reminders' })
export class Reminder {
  @Prop({ required: true })
  reminderId: string;

  @Prop({ ref: 'Task', required: true })
  taskId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: false })
  sent: boolean;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
