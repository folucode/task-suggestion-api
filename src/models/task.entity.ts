import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Task {
  @ObjectIdColumn()
  taskID: string;

  @ObjectIdColumn()
  userId: string;

  @Column()
  title: string;

  @Column()
  priority: number;

  @Column()
  note: string;

  @Column()
  status: string;
}
