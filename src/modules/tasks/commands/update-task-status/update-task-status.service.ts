import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { UpdateTaskStatusCommand } from './update-task-status.command';

@Injectable()
export class UpdateTaskStatusService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(command: UpdateTaskStatusCommand): Promise<Task> {
    const { id, status, user } = command;
    const task = await this.tasksRepository.findOne({ where: { id, user } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
