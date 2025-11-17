import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksRepository', { timestamp: true });

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user '${user.username}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
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

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    try {
      const { title, description } = createTaskDto;
      const task = this.tasksRepository.create({
        title,
        description,
        status: TaskStatus.OPEN,
        user,
      });
      const result = await this.tasksRepository.save(task);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create task for user '${user.username}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    try {
      const task = await this.getTaskById(id, user);
      task.status = status;
      await this.tasksRepository.save(task);

      return task;
    } catch (error) {
      this.logger.error(
        `Failed to update status for task with ID '${id}' for user '${user.username}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async deleteTask(id: string, user: User): Promise<void> {
    try {
      const result = await this.tasksRepository.delete({ id, user });
      if (result.affected === 0) {
        this.logger.warn(
          `Task with ID '${id}' not found for user '${user.username}'`,
        );
        throw new NotFoundException(`Task with ${id} not found`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete task with ID '${id}' for user '${user.username}'`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
