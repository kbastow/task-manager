import { User } from '../../../auth/user.entity';

export class GetTaskByIdQuery {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}
