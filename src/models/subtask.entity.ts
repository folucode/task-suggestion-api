import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';
import { Status, Priority } from 'src/dto/task.dto';

export type SubtaskDocument = HydratedDocument<Subtask>;

@Schema({ timestamps: true, collection: 'subtasks' })
export class Subtask {
  @Prop({ required: true, type: ObjectId })
  subtaskId: ObjectId;

  @Prop({ ref: 'Task', required: true, type: ObjectId })
  parentTaskId: ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Date, default: null })
  due: Date;

  @Prop({ enum: Priority, required: true })
  priority: Priority;

  @Prop({ ref: 'Label', type: ObjectId, default: null })
  labelId: ObjectId;

  @Prop({ default: null })
  note: string;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);
