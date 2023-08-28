import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskHistoryDocument = HydratedDocument<TaskHistory>;

@Schema({ timestamps: true, collection: 'taskhistorys' })
export class TaskHistory {
  @Prop({ required: true })
  taskHistoryId: string;

  @Prop({ ref: 'User', required: true })
  userId: string;

  @Prop({ ref: 'Task', required: true })
  taskId: string;

  @Prop({ required: true })
  dateCompleted: string;
}

export const TaskHistorySchema = SchemaFactory.createForClass(TaskHistory);
