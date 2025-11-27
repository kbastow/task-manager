import { Repository } from 'typeorm';
import { CreateTaskService } from './create-task.service';
import { Task } from '../../domain/task.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../auth/user.entity';
import { CreateTaskCommand } from './create-task.command';

describe('CreateTaskService', () => {
  let service: CreateTaskService;
  let repo: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CreateTaskService>(CreateTaskService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should create new task', async () => {
    const CreateTaskDto = {
      title: 'Test task title',
      description: 'Test task description',
    };
    const savedTask = {
      id: '1',
      ...CreateTaskDto,
      status: 'OPEN',
      user: {} as User,
    } as Task;

    jest.spyOn(repo, 'create').mockReturnValue(savedTask as any);
    jest.spyOn(repo, 'save').mockReturnValue(savedTask as any);

    const mockUser = {} as User;
    const command = new CreateTaskCommand(
      CreateTaskDto.title,
      CreateTaskDto.description,
      mockUser,
    );

    const result = await service.execute(command);

    expect(repo.create).toHaveBeenCalledWith({
      ...CreateTaskDto,
      status: 'OPEN',
      user: mockUser,
    });
    expect(repo.save).toHaveBeenCalledWith(savedTask);
    expect(result).toEqual(savedTask);
  });
});
