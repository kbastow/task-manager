import { User } from 'src/modules/auth/user.entity';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly user: User,
  ) {}
}
