import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  taskID: string;

  @Column({ default: '' })
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
