import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { DeleteTaskCommand } from './delete-task.command';

@Injectable()
export class DeleteTaskService {
  private logger = new Logger('DeleteTaskService');

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    try {
      const { id, user } = command;
      const result = await this.tasksRepository.delete({ id, user });
      if (result.affected === 0) {
        this.logger.warn(
          `Task with ID '${id}' not found for user '${user.username}'`,
        );
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      this.logger.log(
        `Task with ID '${id}' deleted for user '${user.username}'`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete task with ID '${command.id}' for user '${command.user?.username ?? 'unknown'}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
