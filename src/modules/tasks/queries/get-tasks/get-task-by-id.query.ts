import { User } from 'src/modules/auth/user.entity';

export class GetTaskByIdQuery {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}
