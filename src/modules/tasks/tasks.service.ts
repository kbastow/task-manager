import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './domain/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './domain/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/user.entity';
import { Logger } from '@nestjs/common';
import { CreateTaskService } from './commands/create-task/create-task.service';
import { CreateTaskCommand } from './commands/create-task/create-task.command';
import { UpdateTaskStatusCommand } from './commands/update-task-status/update-task-status.command';
import { UpdateTaskStatusService } from './commands/update-task-status/update-task-status.service';
import { DeleteTaskService } from './commands/delete-task/delete-task.service';
import { DeleteTaskCommand } from './commands/delete-task/delete-task.command';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksRepository', { timestamp: true });

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly createTasksService: CreateTaskService,
    private readonly updateTaskStatusService: UpdateTaskStatusService,
    private readonly deleteTaskService: DeleteTaskService,
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
    const command = new CreateTaskCommand(
      createTaskDto.title,
      createTaskDto.description,
      user,
    );
    return await this.createTasksService.execute(command);
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const command = new UpdateTaskStatusCommand(id, status, user);
    return await this.updateTaskStatusService.execute(command);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const command = new DeleteTaskCommand(id, user);
    return this.deleteTaskService.execute(command);
  }
}
