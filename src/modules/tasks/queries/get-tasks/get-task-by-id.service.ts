import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { GetTaskByIdQuery } from './get-task-by-id.query';

@Injectable()
export class GetTaskByIdService {
  private logger = new Logger('GetTaskByIdService');

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(query: GetTaskByIdQuery): Promise<Task> {
    const { id, user } = query;
    try {
      const found = await this.tasksRepository.findOne({ where: { id, user } });
      if (!found) {
        this.logger.warn(
          `Task with ID '${id}' not found for user '${user.username}'`,
        );
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return found;
    } catch (error) {
      this.logger.error(
        `Failed to get task with ID "${id}" for user "${user.username}"`,
        error.stack,
      );
      throw error;
    }
  }
}
