import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LabelDocument = HydratedDocument<Label>;

@Schema()
export class Label {
  @Prop({ required: true })
  labelId: string;

  @Prop({ ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
