import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { TaskStatus } from '../../domain/task-status.enum';
import { CreateTaskCommand } from './create-task.command';

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const { title, description, user } = command;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    return await this.tasksRepository.save(task);
  }
}
