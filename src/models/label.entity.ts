import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

export type LabelDocument = HydratedDocument<Label>;

@Schema()
export class Label {
  @Prop({ required: true })
  labelId: ObjectId;

  @Prop({ ref: 'User', type: ObjectId, required: true })
  userId: string;

  @Prop({ required: true })
  name: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
