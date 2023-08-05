import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto, user): Promise<Task> {
    const task = new Task();
    task.title = createTaskDto.title;
    task.note = createTaskDto.note;
    task.userId = user.userId;
    task.priority = createTaskDto.priority;
    task.status = 'pending';

    return this.tasksRepository.save(task);
  }

  async findAll(user): Promise<Task[]> {
    return this.tasksRepository.find({
      select: ['taskID', 'note', 'status', 'title', 'priority'],
      where: {
        status: 'pending',
        userId: user.userId,
      },
    });
  }

  findOne(id: string, user): Promise<Task> {
    return this.tasksRepository.findOneBy({ taskID: id, userId: user.userId });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      select: ['taskID', 'note', 'status', 'title', 'priority'],
      where: {
        taskID: id,
        userId: user.userId,
      },
    });

    task.note = updateTaskDto.note;
    task.title = updateTaskDto.title;
    task.priority = updateTaskDto.priority;

    return await this.tasksRepository.save({ taskID: id, ...task });
  }

  async markAsDone(id: string, user): Promise<boolean> {
    const task = await this.tasksRepository.findOne({
      select: ['taskID', 'note', 'status', 'title', 'priority'],
      where: {
        taskID: id,
        userId: user.userId,
      },
    });

    task.status = 'done';

    await this.tasksRepository.update(
      { taskID: id },
      {
        ...task,
      },
    );

    return true;
  }

  async getCompletedTasks(user): Promise<Task[]> {
    return await this.tasksRepository.find({
      select: ['taskID', 'note', 'status', 'title', 'priority'],
      where: {
        status: 'done',
        userId: user.userId,
      },
    });
  }

  async removeTask(taskID: string, user): Promise<DeleteResult> {
    return await this.tasksRepository.delete({ taskID, userId: user.userId });
  }
}
