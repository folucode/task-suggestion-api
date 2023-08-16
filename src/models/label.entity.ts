import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { HydratedDocument } from 'mongoose';

export type LabelDocument = HydratedDocument<Label>;

@Schema()
export class Label {
  @Prop({ required: true })
  labelId: ObjectId;

  @Prop({ ref: 'User', type: mongoose.Schema.Types.ObjectId, required: true })
  userId: ObjectId;

  @Prop({ required: true })
  name: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
