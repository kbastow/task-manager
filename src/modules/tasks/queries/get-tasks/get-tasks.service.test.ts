import { Test, TestingModule } from '@nestjs/testing';
import { GetTasksService } from './get-tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../domain/task.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { GetTasksQuery } from './get-tasks.query';
import { TaskStatus } from '../../domain/task-status.enum';

describe('GetTasksService', () => {
  let service: GetTasksService;
  let repo: jest.Mocked<Repository<Task>>;
  let qb: jest.Mocked<SelectQueryBuilder<Task>>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'testpass',
    tasks: [],
  };

  beforeEach(async () => {
    qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(qb),
          },
        },
      ],
    }).compile();

    service = module.get<GetTasksService>(GetTasksService);
    repo = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return tasks with no filters', async () => {
    const query = new GetTasksQuery(
      { search: undefined, status: undefined },
      mockUser,
    );
    const tasks = [{ id: '1' }, { id: '2' }] as Task[];
    qb.getMany.mockResolvedValue(tasks);

    const result = await service.execute(query);

    expect(repo.createQueryBuilder).toHaveBeenCalledWith('task');
    expect(qb.where).toHaveBeenCalledWith({ user: mockUser });
    expect(qb.andWhere).not.toHaveBeenCalled();
    expect(result).toEqual(tasks);
  });

  it('should add status filter if provided', async () => {
    const query = new GetTasksQuery(
      { search: undefined, status: TaskStatus.OPEN },
      mockUser,
    );
    const tasks = [{ id: '1' }] as Task[];
    qb.getMany.mockResolvedValue(tasks);

    const result = await service.execute(query);

    expect(qb.andWhere).toHaveBeenCalledWith('task.status = :status', {
      status: 'OPEN',
    });
    expect(result).toEqual(tasks);
  });

  it('should add search filter if provided', async () => {
    const query = new GetTasksQuery(
      { search: 'test', status: undefined },
      mockUser,
    );
    const tasks = [{ id: '1' }] as Task[];
    qb.getMany.mockResolvedValue(tasks);

    const result = await service.execute(query);

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
      { search: '%test%' },
    );
    expect(result).toEqual(tasks);
  });

  it('should throw InternalServerErrorException on query error', async () => {
    const query = new GetTasksQuery(
      { search: undefined, status: undefined },
      mockUser,
    );
    qb.getMany.mockRejectedValue(new Error('DB error'));

    await expect(service.execute(query)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
