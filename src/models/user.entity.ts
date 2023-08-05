import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  userId: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
