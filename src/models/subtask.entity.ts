import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Status, Priority } from 'src/dto/task.dto';

export type SubtaskDocument = HydratedDocument<Subtask>;

@Schema({ timestamps: true, collection: 'subtasks' })
export class Subtask {
  @Prop({ required: true })
  subtaskId: string;

  @Prop({ ref: 'Task', required: true })
  parentTaskId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop({ type: Date, default: null })
  dueDate: Date;

  @Prop({ enum: Priority, required: true })
  priority: Priority;

  @Prop({ ref: 'Label', default: null })
  labelId: string;

  @Prop({ default: null })
  description: string;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);
