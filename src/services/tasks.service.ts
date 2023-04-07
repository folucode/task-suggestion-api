import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new Task();
    task.title = createTaskDto.title;
    task.note = createTaskDto.note;

    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  findOne(id: string): Promise<Task> {
    return this.tasksRepository.findOneBy({ taskID: id });
  }

  async remove(id: string): Promise<void> {
    await this.tasksRepository.delete(id);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      select: ['taskID', 'note', 'status', 'title'],
      where: {
        taskID: id,
      },
    });

    task.note = updateTaskDto.note;
    task.status = updateTaskDto.status;
    task.title = updateTaskDto.title;

    return await this.tasksRepository.save({ taskID: id, ...task });
  }

  async markAsDone(id: string, note: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      select: ['taskID', 'note', 'status', 'title'],
      where: {
        taskID: id,
      },
    });

    task.status = 'done';
    task.note = note;

    return await this.tasksRepository.save({ taskID: id, ...task });
  }

  async suggestTask(): Promise<Task | string> {
    const tasks = await this.tasksRepository.find({
      select: ['taskID', 'note', 'status', 'title'],
      where: {
        status: 'pending',
      },
    });

    if (tasks.length < 1) return 'no task';

    const randomNumber = Math.floor(Math.random() * tasks.length);
    const suggested = tasks[randomNumber];

    return suggested;
  }
}
