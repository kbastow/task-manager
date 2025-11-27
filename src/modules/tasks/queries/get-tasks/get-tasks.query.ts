import { User } from 'src/modules/auth/user.entity';
import { GetTasksFilterDto } from '../../dto/get-tasks-filter.dto';

export class GetTasksQuery {
  constructor(
    public readonly filterDto: GetTasksFilterDto,
    public readonly user: User,
  ) {}
}
