import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Task {
  @ObjectIdColumn()
  taskID: string;

  @ObjectIdColumn()
  userId: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  note: string;

  @Column({ enum: ['pending', 'done'], default: 'pending' })
  status: string;
}
