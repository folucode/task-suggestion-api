import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  taskID: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  note: string;

  @Column({ enum: ['pending', 'done'], default: 'pending' })
  status: string;
}
