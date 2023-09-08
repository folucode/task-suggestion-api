import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

export enum ActivityActions {
  ADDED_TASK = 'Added Task',
  UPDATED_TASK = 'Updated Task',
  COMPLETED_TASK = 'Completed Task',
  UNCOMPLETED_TASK = 'Uncompleted Task',
  DELETED_TASK = 'Deleted Task',
}

@Schema({
  collection: 'activities',
  timestamps: true,
})
export class Activity {
  @Prop({ required: true })
  activityId: string;

  @Prop({ ref: 'User', required: true })
  userId: string;

  @Prop({ required: true, type: String, maxlength: 1000 })
  comment: string;

  @Prop({ default: null })
  oldValue: string;

  @Prop({ default: null })
  newValue: string;

  @Prop({ required: true, enum: ActivityActions })
  action: ActivityActions;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
