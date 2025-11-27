import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/task.entity';
import { GetTasksQuery } from './get-tasks.query';

@Injectable()
export class GetTasksService {
  private logger = new Logger('GetTasksService');

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async execute(query: GetTasksQuery): Promise<Task[]> {
    const { filterDto, user } = query;
    const { search, status } = filterDto;

    const qb = this.tasksRepository.createQueryBuilder('task');
    qb.where({ user });

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      return await qb.getMany();
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user '${user.username}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
