import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Priority } from 'src/dto/task.dto';
import { Status } from 'src/dto/task.dto';
import { ObjectId } from 'mongodb';

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
  title: string;

  @Prop({ required: true, enum: Priority })
  priority: string;

  @Prop({ text: true, default: null })
  note: string;

  @Prop({ ref: 'Label', type: ObjectId, default: null })
  labelId: ObjectId;

  @Prop({ enum: Status, default: Status.Pending })
  status: string;

  @Prop({ type: Date, default: null })
  due: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('subtasks', {
  ref: 'Subtask',
  localField: 'taskId',
  foreignField: 'parentTaskId',
});
