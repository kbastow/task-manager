import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { TaskStatus } from '../../domain/task-status.enum';
import { CreateTaskCommand } from './create-task.command';

@Injectable()
export class CreateTaskService {
  private logger = new Logger('CreateTaskService');

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const { title, description, user } = command;
    try {
      const task = this.tasksRepository.create({
        title,
        description,
        status: TaskStatus.OPEN,
        user,
      });
      const result = await this.tasksRepository.save(task);
      this.logger.log(`Task created for user '${user.username}'`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create task for user '${user?.username ?? 'unknown'}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
