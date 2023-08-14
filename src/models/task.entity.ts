import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Priority } from 'src/dto/task.dto';
import { Status } from 'src/dto/task.dto';
import { ObjectId } from 'mongodb';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop({ required: true, type: ObjectId })
  taskId: ObjectId;

  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: Priority })
  priority: string;

  @Prop({ text: true })
  note: string;

  @Prop({ enum: Status, default: Status.Pending })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
