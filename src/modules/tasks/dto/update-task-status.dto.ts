import { IsEnum } from 'class-validator';
import { TaskStatus } from '../domain/task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
