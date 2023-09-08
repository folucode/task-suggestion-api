import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Priority } from 'src/dto/task.dto';
import { Status } from 'src/dto/task.dto';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Task {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  priority: Priority;

  @Prop({ default: null })
  description: string;

  @Prop({ ref: 'Label', default: null })
  labelId: string;

  @Prop({ default: Status.Pending })
  status: Status;

  @Prop({ type: Date, default: null })
  dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('subtasks', {
  ref: 'Subtask',
  localField: 'taskId',
  foreignField: 'parentTaskId',
});

TaskSchema.virtual('reminders', {
  ref: 'Reminder',
  localField: 'taskId',
  foreignField: 'taskId',
});

TaskSchema.virtual('recurringTasks', {
  ref: 'RecurringTask',
  localField: 'taskId',
  foreignField: 'taskId',
});

TaskSchema.virtual('labels', {
  ref: 'Label',
  localField: 'labelId',
  foreignField: 'labelId',
});
