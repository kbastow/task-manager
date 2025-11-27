import { Injectable } from '@nestjs/common';
import { TaskStatus } from './domain/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './domain/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { CreateTaskService } from './commands/create-task/create-task.service';
import { CreateTaskCommand } from './commands/create-task/create-task.command';
import { UpdateTaskStatusCommand } from './commands/update-task-status/update-task-status.command';
import { UpdateTaskStatusService } from './commands/update-task-status/update-task-status.service';
import { DeleteTaskService } from './commands/delete-task/delete-task.service';
import { DeleteTaskCommand } from './commands/delete-task/delete-task.command';
import { GetTasksQuery } from './queries/get-tasks/get-tasks.query';
import { GetTasksService } from './queries/get-tasks/get-tasks.service';
import { GetTaskByIdService } from './queries/get-tasks/get-task-by-id.service';
import { GetTaskByIdQuery } from './queries/get-tasks/get-task-by-id.query';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly createTasksService: CreateTaskService,
    private readonly updateTaskStatusService: UpdateTaskStatusService,
    private readonly deleteTaskService: DeleteTaskService,
    private readonly getTasksService: GetTasksService,
    private readonly getTaskByIdService: GetTaskByIdService,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = new GetTasksQuery(filterDto, user);
    return this.getTasksService.execute(query);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const query = new GetTaskByIdQuery(id, user);
    return this.getTaskByIdService.execute(query);
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
