import { User } from '../../../auth/user.entity';

export class DeleteTaskCommand {
  constructor(
    public readonly id: string,
    public readonly user: User,
  ) {}
}
