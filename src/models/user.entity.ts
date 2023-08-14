import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: ObjectId })
  userId: ObjectId;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ minlength: 8, required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
