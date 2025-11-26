import { User } from 'src/modules/auth/user.entity';
import { TaskStatus } from '../../domain/task-status.enum';

export class UpdateTaskStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: TaskStatus,
    public readonly user: User,
  ) {}
}
