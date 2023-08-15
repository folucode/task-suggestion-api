import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationTypes,
} from 'src/utils/notification.utils';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: ObjectId, required: true })
  notificationId: ObjectId;

  @Prop({ ref: 'User', required: true })
  userId: string;

  @Prop({ enum: NotificationTypes, required: true })
  type: NotificationTypes;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ enum: NotificationStatus, required: true })
  status: NotificationStatus;

  @Prop({ required: true })
  triggeredBy: string;

  @Prop()
  metadata: string;

  @Prop({ enum: NotificationPriority, required: true })
  priority: NotificationPriority;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
